// src/routes/rentalRoutes.ts
import { Router } from 'express';
import { RentalController } from '../Controller/RentalController';
import asyncHandler from '../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(RentalController.getAllRentals));
router.post('/', asyncHandler(RentalController.createRental));
router.get('/:id', asyncHandler(RentalController.getRentalById)); // Opcionális, ha kell egyedi lekérdezés
router.put('/:id/return', asyncHandler(RentalController.returnRental));

export default router;