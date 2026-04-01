import { Router } from 'express';
import multer from 'multer';
import { employeeController } from '../controllers/employee.controller';
import { authenticate, requireCompanyUser, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  deleteEmployeeSchema,
  csvImportConfirmSchema,
} from '@cakeday/shared';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// All employee routes require auth + company membership
router.use(authenticate, requireCompanyUser);

// GET /api/v1/employees
router.get('/', employeeController.list.bind(employeeController));

// POST /api/v1/employees
router.post(
  '/',
  requireRole('company_owner', 'hr_manager', 'platform_admin'),
  validate(createEmployeeSchema),
  employeeController.create.bind(employeeController),
);

// POST /api/v1/employees/import/preview
router.post(
  '/import/preview',
  requireRole('company_owner', 'hr_manager', 'platform_admin'),
  upload.single('file'),
  employeeController.importPreview.bind(employeeController),
);

// POST /api/v1/employees/import/confirm
router.post(
  '/import/confirm',
  requireRole('company_owner', 'hr_manager', 'platform_admin'),
  validate(csvImportConfirmSchema),
  employeeController.importConfirm.bind(employeeController),
);

// GET /api/v1/employees/:id
router.get('/:id', employeeController.getOne.bind(employeeController));

// PATCH /api/v1/employees/:id
router.patch(
  '/:id',
  requireRole('company_owner', 'hr_manager', 'platform_admin'),
  validate(updateEmployeeSchema),
  employeeController.update.bind(employeeController),
);

// DELETE /api/v1/employees/:id
router.delete(
  '/:id',
  requireRole('company_owner', 'hr_manager', 'platform_admin'),
  validate(deleteEmployeeSchema),
  employeeController.remove.bind(employeeController),
);

export default router;
