import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { profiles, companyMemberships } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import type { UserRole } from "@/lib/shared";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  companyId: string | null;
  bakeryId: string | null;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (!supabaseUser) return null;

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, supabaseUser.id))
    .limit(1);

  if (!profile) return null;

  let companyId: string | null = null;
  if (profile.role !== 'bakery_admin' && profile.role !== 'platform_admin') {
    const [membership] = await db
      .select({ company_id: companyMemberships.company_id })
      .from(companyMemberships)
      .where(eq(companyMemberships.user_id, profile.id))
      .limit(1);
    companyId = membership?.company_id ?? null;
  }

  return {
    id: profile.id,
    email: supabaseUser.email ?? '',
    role: profile.role as UserRole,
    companyId,
    bakeryId: profile.bakery_id,
  };
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

export function requireRole(user: AuthUser, ...roles: UserRole[]): void {
  if (!roles.includes(user.role)) {
    throw new ForbiddenError();
  }
}

export function requireCompanyUser(user: AuthUser): string {
  if (!user.companyId) {
    throw new ForbiddenError('Bu işlem için şirket hesabı gereklidir.');
  }
  return user.companyId;
}

export function requireBakeryUser(user: AuthUser): string {
  if (user.role !== 'bakery_admin' || !user.bakeryId) {
    throw new ForbiddenError('Bu işlem için pastane hesabı gereklidir.');
  }
  return user.bakeryId;
}
