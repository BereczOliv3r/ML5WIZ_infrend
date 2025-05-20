// src/controller/VideoController.ts
    import { Request, Response } from 'express';
    import { AppDataSource } from '../data-source'; // Figyelj a helyes relatív útvonalra!
    import { Video } from '../entity/Video';
    import { FindOptionsWhere, ILike } from 'typeorm';

    const videoRepository = AppDataSource.getRepository(Video);

    export class VideoController {
        static async getAllVideos(req: Request, res: Response) {
            const videos = await videoRepository.find();
            res.json(videos);
        }

        static async createVideo(req: Request, res: Response) {
            const { title, director, status = 'szabad', acquisitionDate, serialNumber } = req.body;
            if (!title || !director) {
                return res.status(400).json({ message: 'A cím és a rendező megadása kötelező.' });
            }
            const video = new Video();
            video.title = title;
            video.director = director;
            video.status = status;
            video.acquisitionDate = acquisitionDate || new Date().toISOString().split('T')[0];
            video.serialNumber = serialNumber;

            const savedVideo = await videoRepository.save(video);
            res.status(201).json(savedVideo);
        }

        static async getVideoById(req: Request, res: Response) {
            const videoId = parseInt(req.params.id);
            if (isNaN(videoId)) {
                return res.status(400).json({ message: "Érvénytelen videó ID." });
            }
            const video = await videoRepository.findOneBy({ id: videoId });
            if (video) {
                res.json(video);
            } else {
                res.status(404).json({ message: 'Videó nem található' });
            }
        }

        static async updateVideo(req: Request, res: Response) {
            const videoId = parseInt(req.params.id);
            if (isNaN(videoId)) {
                return res.status(400).json({ message: "Érvénytelen videó ID." });
            }
            let videoToUpdate = await videoRepository.findOneBy({ id: videoId });

            if (!videoToUpdate) {
                return res.status(404).json({ message: 'A módosítandó videó nem található' });
            }
            videoRepository.merge(videoToUpdate, req.body); // Összefésüli az új adatokat a meglévő entitással
            const updatedVideo = await videoRepository.save(videoToUpdate);
            res.json(updatedVideo);
        }

        static async deleteVideo(req: Request, res: Response) {
            const videoId = parseInt(req.params.id);
            if (isNaN(videoId)) {
                return res.status(400).json({ message: "Érvénytelen videó ID." });
            }
            let videoToUpdate = await videoRepository.findOne({
                where: { id: videoId },
                relations: ["rentals"] // Betöltjük a kölcsönzéseket a státusz ellenőrzéshez
            });

            if (!videoToUpdate) {
                return res.status(404).json({ message: 'A selejtezendő videó nem található' });
            }
            const hasActiveRental = videoToUpdate.rentals && videoToUpdate.rentals.some(r => r.status === 'rented');
            if (hasActiveRental) {
                 return res.status(400).json({ message: 'Kikölcsönzött videót nem lehet selejtezni. Először vissza kell hozni.' });
            }
            if (videoToUpdate.status === 'selejtezett') {
                return res.status(400).json({ message: 'Ez a videó már selejtezett státuszban van.' });
            }

            videoToUpdate.status = 'selejtezett';
            const updatedVideo = await videoRepository.save(videoToUpdate);
            res.json({ message: 'Videó sikeresen selejtezett státuszba helyezve', video: updatedVideo });
        }
    }
    