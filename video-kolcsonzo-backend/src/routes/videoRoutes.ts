    // src/routes/videoRoutes.ts
    import { Router } from 'express';
    import { VideoController } from '../Controller/VideoController';
    import asyncHandler from '../utils/asyncHandler'; // Importáljuk a segédfüggvényt

    const router = Router();

    router.get('/', asyncHandler(VideoController.getAllVideos));
    router.post('/', asyncHandler(VideoController.createVideo));
    router.get('/:id', asyncHandler(VideoController.getVideoById));
    router.put('/:id', asyncHandler(VideoController.updateVideo));
    router.delete('/:id', asyncHandler(VideoController.deleteVideo));

    export default router;
    