import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate, requireCompanyUser, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createAdHocOrderSchema, cancelOrderSchema } from '@cakeday/shared';

const router = Router();

router.use(authenticate, requireCompanyUser);

// GET /api/v1/orders
router.get('/', orderController.list.bind(orderController));

// POST /api/v1/orders
router.post(
  '/',
  requireRole('company_owner', 'hr_manager', 'platform_admin'),
  validate(createAdHocOrderSchema),
  orderController.create.bind(orderController),
);

// GET /api/v1/orders/:id
router.get('/:id', orderController.getOne.bind(orderController));

// PATCH /api/v1/orders/:id/cancel
router.patch(
  '/:id/cancel',
  requireRole('company_owner', 'hr_manager', 'platform_admin'),
  validate(cancelOrderSchema),
  orderController.cancel.bind(orderController),
);

export default router;
