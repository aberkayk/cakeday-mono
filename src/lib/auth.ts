import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users, companies, bakeries } from "@/lib/db/schema";
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

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, supabaseUser.id))
    .limit(1);

  if (!user) return null;

  let companyId: string | null = null;
  let bakeryId: string | null = null;

  if (user.role === 'bakery_admin') {
    const [bakery] = await db
      .select({ id: bakeries.id })
      .from(bakeries)
      .where(eq(bakeries.user_id, user.id))
      .limit(1);
    bakeryId = bakery?.id ?? null;
  } else if (user.role !== 'platform_admin') {
    const [company] = await db
      .select({ id: companies.id })
      .from(companies)
      .where(eq(companies.user_id, user.id))
      .limit(1);
    companyId = company?.id ?? null;
  }

  return {
    id: user.id,
    email: supabaseUser.email ?? '',
    role: user.role as UserRole,
    companyId,
    bakeryId,
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
