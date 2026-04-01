/**
 * Admin Routes — Platform Admin only
 *
 * All routes under /api/v1/admin require `platform_admin` role.
 * This file mounts sub-routers for each admin domain.
 *
 * TODO: Implement full admin sub-routes as the platform grows.
 */
import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

// All admin routes require platform_admin role
router.use(authenticate, requireRole('platform_admin'));

// ─── Companies Admin ──────────────────────────────────────────────────────────
// TODO: GET    /api/v1/admin/companies         — List all companies (paginated, filterable)
// TODO: GET    /api/v1/admin/companies/:id     — Get company detail
// TODO: PATCH  /api/v1/admin/companies/:id     — Update company (status, plan, admin_note)
// TODO: POST   /api/v1/admin/companies/:id/approve — Approve company
// TODO: POST   /api/v1/admin/companies/:id/suspend  — Suspend company

router.get('/companies', (_req: Request, res: Response) => {
  sendSuccess(res, { message: 'TODO: List all companies' });
});

router.get('/companies/:id', (_req: Request, res: Response) => {
  sendSuccess(res, { message: 'TODO: Get company by id' });
});

router.patch('/companies/:id', (_req: Request, res: Response) => {
  sendSuccess(res, { message: 'TODO: Update company' });
});

// ─── Bakeries Admin ───────────────────────────────────────────────────────────
// TODO: GET    /api/v1/admin/bakeries          — List all bakeries
// TODO: POST   /api/v1/admin/bakeries          — Create + invite bakery
// TODO: GET    /api/v1/admin/bakeries/:id      — Get bakery detail
// TODO: PATCH  /api/v1/admin/bakeries/:id      — Update bakery (status, districts, etc.)
// TODO: DELETE /api/v1/admin/bakeries/:id      — Deactivate bakery

router.get('/bakeries', (_req: Request, res: Response) => {
  sendSuccess(res, { message: 'TODO: List all bakeries' });
});

router.post('/bakeries', (_req: Request, res: Response) => {
  sendSuccess(res, { message: 'TODO: Create bakery' });
});

router.get('/bakeries/:id', (_req: Request, res: Response) => {
  sendSuccess(res, { message: 'TODO: Get bakery by id' });
});

router.patch('/bakeries/:id', (_req: Request, res: Response) => {
  sendSuccess(res, { message: 'TODO: Update bakery' });
});

// ─── Orders Admin ─────────────────────────────────────────────────────────────
// TODO: GET    /api/v1/admin/orders            — List all orders across all companies
// TODO: GET    /api/v1/admin/orders/:id        — Get order detail
// TODO: PATCH  /api/v1/admin/orders/:id/status — Override order status (with note)
// TODO: POST   /api/v1/admin/orders/:id/assign — Manually assign order to bakery

router.get('/orders', (_req: Request, res: Response) => {
  sendSuccess(res, { message: 'TODO: List all orders' });
});

router.get('/orders/:id', (_req: Request, res: Response) => {
  sendSuccess(res, { message: 'TODO: Get order by id' });
});

router.patch('/orders/:id/status', (_req: Request, res: Response) => {
  sendSuccess(res, { message: 'TODO: Override order status' });
});

// ─── Catalogue Admin ──────────────────────────────────────────────────────────
// TODO: GET    /api/v1/admin/catalogue/cakes           — List all cake types
// TODO: POST   /api/v1/admin/catalogue/cakes           — Create cake type
// TODO: PATCH  /api/v1/admin/catalogue/cakes/:id       — Update cake type
// TODO: DELETE /api/v1/admin/catalogue/cakes/:id       — Deactivate cake type
// TODO: GET    /api/v1/admin/catalogue/price-requests  — List pending price change requests
// TODO: PATCH  /api/v1/admin/catalogue/price-requests/:id — Approve/reject price request

router.get('/catalogue/cakes', (_req: Request, res: Response) => {
  sendSuccess(res, { message: 'TODO: List all cake types' });
});

router.post('/catalogue/cakes', (_req: Request, res: Response) => {
  sendSuccess(res, { message: 'TODO: Create cake type' });
});

router.patch('/catalogue/cakes/:id', (_req: Request, res: Response) => {
  sendSuccess(res, { message: 'TODO: Update cake type' });
});

router.get('/catalogue/price-requests', (_req: Request, res: Response) => {
  sendSuccess(res, { message: 'TODO: List price change requests' });
});

router.patch('/catalogue/price-requests/:id', (_req: Request, res: Response) => {
  sendSuccess(res, { message: 'TODO: Review price change request' });
});

// ─── Subscription Plans Admin ─────────────────────────────────────────────────
// TODO: GET    /api/v1/admin/plans             — List subscription plans
// TODO: POST   /api/v1/admin/plans             — Create plan
// TODO: PATCH  /api/v1/admin/plans/:id         — Update plan

router.get('/plans', (_req: Request, res: Response) => {
  sendSuccess(res, { message: 'TODO: List subscription plans' });
});

// ─── System Settings Admin ────────────────────────────────────────────────────
// TODO: GET    /api/v1/admin/settings          — List system settings
// TODO: PATCH  /api/v1/admin/settings/:key     — Update system setting

router.get('/settings', (_req: Request, res: Response) => {
  sendSuccess(res, { message: 'TODO: List system settings' });
});

// ─── Users Admin ──────────────────────────────────────────────────────────────
// TODO: GET    /api/v1/admin/users             — List all users
// TODO: GET    /api/v1/admin/users/:id         — Get user detail
// TODO: PATCH  /api/v1/admin/users/:id         — Update user (role, etc.)

router.get('/users', (_req: Request, res: Response) => {
  sendSuccess(res, { message: 'TODO: List all users' });
});

export default router;
