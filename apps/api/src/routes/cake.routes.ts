import { Router } from 'express';
import { cakeController } from '../controllers/cake.controller';
import { authenticate } from '../middleware/auth';
import { readRateLimiter } from '../middleware/rate-limiter';

const router = Router();

// Cakes are readable by any authenticated user (company or bakery)
router.use(authenticate, readRateLimiter);

// GET /api/v1/cakes
router.get('/', cakeController.list.bind(cakeController));

// GET /api/v1/cakes/:id
router.get('/:id', cakeController.getOne.bind(cakeController));

export default router;
