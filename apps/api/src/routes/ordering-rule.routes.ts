import { Router } from 'express';
import { orderingRuleController } from '../controllers/ordering-rule.controller';
import { authenticate, requireCompanyUser, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createOrderingRuleSchema, updateOrderingRuleSchema } from '@cakeday/shared';

const router = Router();

router.use(authenticate, requireCompanyUser);

// GET /api/v1/ordering-rules
router.get('/', orderingRuleController.list.bind(orderingRuleController));

// POST /api/v1/ordering-rules
router.post(
  '/',
  requireRole('company_owner', 'hr_manager', 'platform_admin'),
  validate(createOrderingRuleSchema),
  orderingRuleController.create.bind(orderingRuleController),
);

// GET /api/v1/ordering-rules/:id
router.get('/:id', orderingRuleController.getOne.bind(orderingRuleController));

// PATCH /api/v1/ordering-rules/:id
router.patch(
  '/:id',
  requireRole('company_owner', 'hr_manager', 'platform_admin'),
  validate(updateOrderingRuleSchema),
  orderingRuleController.update.bind(orderingRuleController),
);

// DELETE /api/v1/ordering-rules/:id
router.delete(
  '/:id',
  requireRole('company_owner', 'hr_manager', 'platform_admin'),
  orderingRuleController.remove.bind(orderingRuleController),
);

export default router;
