// src/controller/RentalController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Rental } from '../entity/Rental';
import { Video } from '../entity/Video';
import { Customer } from '../entity/Customer';
import { FindOptionsWhere, LessThan } from 'typeorm'; // LessThan importálva

const rentalRepository = AppDataSource.getRepository(Rental);
const videoRepository = AppDataSource.getRepository(Video);
const customerRepository = AppDataSource.getRepository(Customer);

export class RentalController {
    static async getAllRentals(req: Request, res: Response) {
        const { customerId, videoId, status } = req.query;
        const whereOptions: FindOptionsWhere<Rental> = {};

        if (customerId) {
            const parsedCustomerId = parseInt(customerId as string);
            if (!isNaN(parsedCustomerId)) whereOptions.customerId = parsedCustomerId;
        }
        if (videoId) {
            const parsedVideoId = parseInt(videoId as string);
            if (!isNaN(parsedVideoId)) whereOptions.videoId = parsedVideoId;
        }
        if (status) whereOptions.status = status as string;

        const rentals = await rentalRepository.find({
            where: whereOptions,
            relations: ["customer", "video"] // Betöltjük a kapcsolódó ügyfelet és videót is
        });
        res.json(rentals);
    }

    static async createRental(req: Request, res: Response) {
        const { customerId, videoId } = req.body;
        if (customerId === undefined || videoId === undefined) {
            return res.status(400).json({ message: 'customerId és videoId megadása kötelező.' });
        }
        const parsedCustomerId = parseInt(customerId);
        const parsedVideoId = parseInt(videoId);

        if (isNaN(parsedCustomerId) || isNaN(parsedVideoId)) {
            return res.status(400).json({ message: "Érvénytelen customerId vagy videoId." });
        }

        const customer = await customerRepository.findOneBy({ id: parsedCustomerId, status: "active" });
        if (!customer) {
            return res.status(404).json({ message: `Ügyfél (ID: ${parsedCustomerId}) nem található vagy nem aktív.` });
        }

        const video = await videoRepository.findOneBy({ id: parsedVideoId });
        if (!video) {
            return res.status(404).json({ message: `Videó (ID: ${parsedVideoId}) nem található.` });
        }
        if (video.status !== 'szabad') {
            return res.status(400).json({ message: `A videó (ID: ${parsedVideoId}) jelenleg nem kölcsönözhető (státusz: ${video.status}).` });
        }

        video.status = 'kikölcsönzött';
        await videoRepository.save(video);

        const rental = new Rental();
        rental.customerId = parsedCustomerId;
        rental.videoId = parsedVideoId;
        rental.status = 'rented';

        const savedRental = await rentalRepository.save(rental);
        const updatedVideo = await videoRepository.findOneBy({ id: parsedVideoId }); // Frissített videó adatok
        res.status(201).json({ message: 'Kölcsönzés sikeresen rögzítve.', rental: savedRental, video: updatedVideo });
    }

    static async returnRental(req: Request, res: Response) {
        const rentalId = parseInt(req.params.id);
        if (isNaN(rentalId)) {
            return res.status(400).json({ message: "Érvénytelen kölcsönzés ID." });
        }
        let rentalToUpdate = await rentalRepository.findOneBy({ id: rentalId });

        if (!rentalToUpdate) {
            return res.status(404).json({ message: `Kölcsönzés (ID: ${rentalId}) nem található.` });
        }
        if (rentalToUpdate.status === 'returned') {
            return res.status(400).json({ message: 'Ez a kölcsönzés már lezárult (a videót visszahozták).' });
        }

        rentalToUpdate.returnDate = new Date();
        rentalToUpdate.status = 'returned';

        const video = await videoRepository.findOneBy({ id: rentalToUpdate.videoId });
        if (video) {
            video.status = 'szabad';
            await videoRepository.save(video);
        } else {
            console.error(`Hiba: A ${rentalToUpdate.videoId} ID-jű videó nem található a visszahozatalkor a ${rentalId} ID-jű kölcsönzéshez.`);
        }
        const updatedRental = await rentalRepository.save(rentalToUpdate);
        const updatedVideo = await videoRepository.findOneBy({ id: rentalToUpdate.videoId }); // Frissített videó adatok
        res.json({ message: 'Videó sikeresen visszahozva.', rental: updatedRental, video: updatedVideo });
    }

    static async getRentalById(req: Request, res: Response) {
        const rentalId = parseInt(req.params.id);
        if (isNaN(rentalId)) {
            return res.status(400).json({ message: "Érvénytelen kölcsönzés ID." });
        }
        const rental = await rentalRepository.findOne({
            where: { id: rentalId },
            relations: ["customer", "video"]
        });
        if (rental) {
            res.json(rental);
        } else {
            res.status(404).json({ message: `Kölcsönzés (ID: ${rentalId}) nem található.` });
        }
    }

    // ÚJ METÓDUS: Késések lekérdezése
    static async getOverdueRentals(req: Request, res: Response) {
        const overdueThresholdDays = 1; // Ezt az értéket később konfigurálhatóvá teheted
        const now = new Date();
        
        // Az a dátum, amelynél régebbi 'rentalDate'-tel rendelkező, 'rented' státuszú elemeket keresünk
        const thresholdDate = new Date(now);
        thresholdDate.setDate(now.getDate() - overdueThresholdDays);

        const overdueRentalsRaw = await rentalRepository.find({
            where: {
                status: 'rented',
                rentalDate: LessThan(thresholdDate) // Olyan kölcsönzések, amelyek régebbiek, mint (most - türelmi idő)
            },
            relations: ["customer", "video"] // Betöltjük a kapcsolódó ügyfelet és videót is
        });

        const overdueRentalsFormatted = overdueRentalsRaw.map(rental => {
            const rentalDate = new Date(rental.rentalDate); // Biztosítjuk, hogy Dátum objektum legyen
            const dueDate = new Date(rentalDate);
            dueDate.setDate(rentalDate.getDate() + overdueThresholdDays); // Határidő = kölcsönzés dátuma + türelmi idő

            // Késés napokban (egész napokra kerekítve, felfelé)
            // A Math.max(0, ...) biztosítja, hogy ne legyen negatív a késés
            const daysOverdue = Math.max(0, Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));

            return {
                rentalId: rental.id,
                rentalDate: rental.rentalDate.toISOString(),
                dueDate: dueDate.toISOString(),
                daysOverdue,
                customer: rental.customer ? {
                    id: rental.customer.id,
                    name: rental.customer.name,
                    phone: rental.customer.phone,
                    address: rental.customer.address
                } : null,
                video: rental.video ? {
                    id: rental.video.id,
                    title: rental.video.title,
                    serialNumber: rental.video.serialNumber
                } : null
            };
        });

        res.json(overdueRentalsFormatted);
    }
}
