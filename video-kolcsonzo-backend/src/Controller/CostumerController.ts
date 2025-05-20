// src/controller/CustomerController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source'; // Figyelj a helyes relatív útvonalra!
import { Customer } from '../entity/Customer';
import { FindOptionsWhere, ILike } from 'typeorm';

const customerRepository = AppDataSource.getRepository(Customer);

export class CustomerController {
    static async getAllCustomers(req: Request, res: Response) {
        const { name, idCardNumber, id, status } = req.query;
        const whereOptions: FindOptionsWhere<Customer> = {};

        if (name) whereOptions.name = ILike(`%${name as string}%`);
        if (idCardNumber) whereOptions.idCardNumber = ILike(`%${idCardNumber as string}%`);
        if (id) {
            const parsedId = parseInt(id as string);
            if (!isNaN(parsedId)) whereOptions.id = parsedId;
        }
        if (status) whereOptions.status = status as string;

        const customers = await customerRepository.find({ where: whereOptions });
        res.json(customers);
    }

    static async createCustomer(req: Request, res: Response) {
        const { name, phone, idCardNumber, address, status = 'active' } = req.body;
        if (!name || !phone || !idCardNumber || !address) {
            return res.status(400).json({ message: 'Minden kötelező mező kitöltése szükséges (név, telefon, szig.szám, lakcím).' });
        }
        const customer = new Customer();
        customer.name = name;
        customer.phone = phone;
        customer.idCardNumber = idCardNumber;
        customer.address = address;
        customer.status = status;

        const savedCustomer = await customerRepository.save(customer);
        res.status(201).json(savedCustomer);
    }

    static async getCustomerById(req: Request, res: Response) {
        const customerId = parseInt(req.params.id);
        if (isNaN(customerId)) {
            return res.status(400).json({ message: "Érvénytelen ügyfél ID." });
        }
        const customer = await customerRepository.findOneBy({ id: customerId });
        if (customer) {
            res.json(customer);
        } else {
            res.status(404).json({ message: 'Ügyfél nem található' });
        }
    }

    static async updateCustomer(req: Request, res: Response) {
        const customerId = parseInt(req.params.id);
        if (isNaN(customerId)) {
            return res.status(400).json({ message: "Érvénytelen ügyfél ID." });
        }
        let customerToUpdate = await customerRepository.findOneBy({ id: customerId });

        if (!customerToUpdate) {
            return res.status(404).json({ message: 'A módosítandó ügyfél nem található' });
        }
        // Összefésüli az új adatokat a meglévő entitással, csak a request body-ban lévő mezőket frissíti
        customerRepository.merge(customerToUpdate, req.body);

        // Opcionális: Validáció a status értékére
        if (req.body.status !== undefined && !['active', 'deleted', 'inactive'].includes(req.body.status)) {
            return res.status(400).json({ message: 'Érvénytelen státusz érték. Lehetséges értékek: active, deleted, inactive.' });
        }

        const updatedCustomer = await customerRepository.save(customerToUpdate);
        res.json(updatedCustomer);
    }

    static async deleteCustomer(req: Request, res: Response) {
        const customerId = parseInt(req.params.id);
        if (isNaN(customerId)) {
            return res.status(400).json({ message: "Érvénytelen ügyfél ID." });
        }
        let customerToUpdate = await customerRepository.findOneBy({ id: customerId });

        if (!customerToUpdate) {
            return res.status(404).json({ message: 'A törlendő ügyfél nem található' });
        }
        if (customerToUpdate.status === 'deleted') {
            return res.status(400).json({ message: 'Ez az ügyfél már törölt státuszban van.' });
        }
        // TODO: Ellenőrizni kellene, hogy van-e aktív kölcsönzése az ügyfélnek, mielőtt töröljük!
        // Ezt a RentalControllerrel való együttműködésben lehet majd megvalósítani,
        // vagy egy dedikált service rétegben.

        customerToUpdate.status = 'deleted';
        const updatedCustomer = await customerRepository.save(customerToUpdate);
        res.json({ message: 'Ügyfél sikeresen törölt státuszba helyezve', customer: updatedCustomer });
    }
}
