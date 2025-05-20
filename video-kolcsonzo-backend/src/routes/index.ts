    // src/routes/index.ts
    import { Router } from 'express';
    import videoRoutes from './videoRoutes';
    import customerRoutes from './costumerRoutes'; // Ezt majd létre kell hoznod
    import rentalRoutes from './rentalRoutes';   // Ezt majd létre kell hoznod

    const router = Router();

    router.use('/videos', videoRoutes);
    router.use('/customers', customerRoutes); 
    router.use('/rentals', rentalRoutes);     

    export default router;
    