import { Router } from 'express';
import { companyController } from '../controllers/company.controller';
import { authenticate, requireCompanyUser, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  updateCompanyProfileSchema,
  updateCompanySettingsSchema,
  inviteUserSchema,
} from '@cakeday/shared';

const router = Router();

// All company routes require auth + company membership
router.use(authenticate, requireCompanyUser);

// GET /api/v1/companies/me
router.get('/me', companyController.getMyCompany.bind(companyController));

// PATCH /api/v1/companies/me
router.patch(
  '/me',
  requireRole('company_owner', 'platform_admin'),
  validate(updateCompanyProfileSchema),
  companyController.updateMyCompany.bind(companyController),
);

// GET /api/v1/companies/me/settings
router.get('/me/settings', companyController.getMySettings.bind(companyController));

// PATCH /api/v1/companies/me/settings
router.patch(
  '/me/settings',
  requireRole('company_owner', 'platform_admin'),
  validate(updateCompanySettingsSchema),
  companyController.updateMySettings.bind(companyController),
);

// GET /api/v1/companies/me/members
router.get('/me/members', companyController.getMembers.bind(companyController));

// POST /api/v1/companies/me/members/invite
router.post(
  '/me/members/invite',
  requireRole('company_owner', 'platform_admin'),
  validate(inviteUserSchema),
  companyController.inviteMember.bind(companyController),
);

export default router;
