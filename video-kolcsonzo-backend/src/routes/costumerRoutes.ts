// src/routes/customerRoutes.ts
import { Router } from 'express';
import { CustomerController } from '../Controller/CostumerController';
import asyncHandler from '../utils/asyncHandler'; // Importáljuk a segédfüggvényt

const router = Router();

router.get('/', asyncHandler(CustomerController.getAllCustomers));
router.post('/', asyncHandler(CustomerController.createCustomer));
router.get('/:id', asyncHandler(CustomerController.getCustomerById));
router.put('/:id', asyncHandler(CustomerController.updateCustomer));
router.delete('/:id', asyncHandler(CustomerController.deleteCustomer));

export default router;