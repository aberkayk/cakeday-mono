import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { db } from '../config/database';
import { profiles, companyMemberships } from '../db/schema';
import { eq } from 'drizzle-orm';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import type { UserRole } from '@cakeday/shared';
// PERMISSIONS is exported from the shared package index — re-exported here for convenience
// We re-declare the minimal shape needed to avoid circular workspace import issues
const PERMISSIONS = {
  'companies:read': ['company_owner', 'hr_manager', 'finance', 'viewer', 'platform_admin'] as UserRole[],
  'companies:write': ['company_owner', 'platform_admin'] as UserRole[],
  'employees:read': ['company_owner', 'hr_manager', 'viewer', 'platform_admin'] as UserRole[],
  'employees:write': ['company_owner', 'hr_manager', 'platform_admin'] as UserRole[],
  'orders:read': ['company_owner', 'hr_manager', 'finance', 'viewer', 'platform_admin'] as UserRole[],
  'orders:write': ['company_owner', 'hr_manager', 'platform_admin'] as UserRole[],
  'billing:read': ['company_owner', 'finance', 'platform_admin'] as UserRole[],
  'billing:write': ['company_owner', 'finance', 'platform_admin'] as UserRole[],
  'users:manage': ['company_owner', 'platform_admin'] as UserRole[],
  'bakery:orders:read': ['bakery_admin', 'platform_admin'] as UserRole[],
  'bakery:orders:write': ['bakery_admin', 'platform_admin'] as UserRole[],
  'bakery:prices:read': ['bakery_admin', 'platform_admin'] as UserRole[],
  'bakery:prices:write': ['bakery_admin', 'platform_admin'] as UserRole[],
  'admin:*': ['platform_admin'] as UserRole[],
} as const;

export type Permission = keyof typeof PERMISSIONS;

// Extend Express Request to carry authenticated user context
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        company_id: string | null;
        bakery_id: string | null;
      };
    }
  }
}

/**
 * Verify the Supabase JWT from the Authorization header.
 * Attaches req.user with id, email, role, company_id, bakery_id.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Bearer token required.');
    }

    const token = authHeader.slice(7);

    // Verify token with Supabase
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
      throw new UnauthorizedError('Invalid or expired token.');
    }

    const supabaseUser = data.user;

    // Load profile from our DB
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, supabaseUser.id))
      .limit(1);

    if (!profile) {
      throw new UnauthorizedError('User profile not found.');
    }

    // Resolve company_id from membership
    let company_id: string | null = null;
    if (
      profile.role !== 'bakery_admin' &&
      profile.role !== 'platform_admin'
    ) {
      const [membership] = await db
        .select({ company_id: companyMemberships.company_id })
        .from(companyMemberships)
        .where(eq(companyMemberships.user_id, profile.id))
        .limit(1);
      company_id = membership?.company_id ?? null;
    }

    req.user = {
      id: profile.id,
      email: supabaseUser.email ?? '',
      role: profile.role,
      company_id,
      bakery_id: profile.bakery_id,
    };

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Require that the authenticated user has a specific permission.
 */
export function requirePermission(permission: Permission) {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    const req = _req;
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    const allowed = PERMISSIONS[permission] as readonly UserRole[];
    if (!allowed.includes(req.user.role)) {
      return next(new ForbiddenError());
    }
    next();
  };
}

/**
 * Require one of the provided roles.
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError());
    }
    next();
  };
}

/**
 * Require the user to belong to a company (not bakery or platform admin).
 */
export function requireCompanyUser(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    return next(new UnauthorizedError());
  }
  if (!req.user.company_id) {
    return next(new ForbiddenError('This endpoint requires a company account.'));
  }
  next();
}

/**
 * Require the user to be a bakery admin.
 */
export function requireBakeryUser(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    return next(new UnauthorizedError());
  }
  if (req.user.role !== 'bakery_admin') {
    return next(new ForbiddenError('This endpoint requires a bakery account.'));
  }
  if (!req.user.bakery_id) {
    return next(new ForbiddenError('Bakery account not properly configured.'));
  }
  next();
}
