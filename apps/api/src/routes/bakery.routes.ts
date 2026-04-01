import { Router } from 'express';
import { bakeryController } from '../controllers/bakery.controller';
import { authenticate, requireBakeryUser } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { bakeryRejectOrderSchema } from '@cakeday/shared';

const router = Router();

// All bakery routes require auth + bakery_admin role + bakery_id
router.use(authenticate, requireBakeryUser);

// GET /api/v1/bakery/orders
router.get('/orders', bakeryController.listOrders.bind(bakeryController));

// GET /api/v1/bakery/orders/:id
router.get('/orders/:id', bakeryController.getOrder.bind(bakeryController));

// PATCH /api/v1/bakery/orders/:id/accept
router.patch('/orders/:id/accept', bakeryController.acceptOrder.bind(bakeryController));

// PATCH /api/v1/bakery/orders/:id/reject
router.patch(
  '/orders/:id/reject',
  validate(bakeryRejectOrderSchema),
  bakeryController.rejectOrder.bind(bakeryController),
);

// PATCH /api/v1/bakery/orders/:id/preparing
router.patch('/orders/:id/preparing', bakeryController.markPreparing.bind(bakeryController));

// PATCH /api/v1/bakery/orders/:id/out-for-delivery
router.patch('/orders/:id/out-for-delivery', bakeryController.markOutForDelivery.bind(bakeryController));

// PATCH /api/v1/bakery/orders/:id/delivered
router.patch('/orders/:id/delivered', bakeryController.markDelivered.bind(bakeryController));

export default router;
