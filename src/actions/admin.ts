'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth, requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { companies, cakeTypes, priceChangeRequests } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function approveCompany(companyId: string) {
  const user = await requireAuth();
  requireRole(user, 'platform_admin');

  const result = await db
    .update(companies)
    .set({ status: 'active', updated_at: new Date() })
    .where(eq(companies.id, companyId))
    .returning();

  revalidatePath('/admin');
  return result[0];
}

export async function suspendCompany(companyId: string) {
  const user = await requireAuth();
  requireRole(user, 'platform_admin');

  const result = await db
    .update(companies)
    .set({ status: 'suspended', updated_at: new Date() })
    .where(eq(companies.id, companyId))
    .returning();

  revalidatePath('/admin');
  return result[0];
}

export async function createCakeType(data: {
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_gluten_free?: boolean;
  is_vegan?: boolean;
  allergens?: string[];
  is_seasonal?: boolean;
  display_order?: number;
}) {
  const user = await requireAuth();
  requireRole(user, 'platform_admin');

  const [cakeType] = await db
    .insert(cakeTypes)
    .values({
      name: data.name,
      slug: data.slug,
      description: data.description,
      image_url: data.image_url,
      is_gluten_free: data.is_gluten_free ?? false,
      is_vegan: data.is_vegan ?? false,
      allergens: data.allergens ?? [],
      is_seasonal: data.is_seasonal ?? false,
      display_order: data.display_order ?? 0,
    })
    .returning();

  revalidatePath('/admin');
  return cakeType;
}

export async function updateCakeType(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    image_url?: string;
    is_gluten_free?: boolean;
    is_vegan?: boolean;
    allergens?: string[];
    is_seasonal?: boolean;
    is_active?: boolean;
    display_order?: number;
  },
) {
  const user = await requireAuth();
  requireRole(user, 'platform_admin');

  const [updated] = await db
    .update(cakeTypes)
    .set({ ...data, updated_at: new Date() })
    .where(eq(cakeTypes.id, id))
    .returning();

  revalidatePath('/admin');
  return updated;
}

export async function approvePricingRequest(requestId: string) {
  const user = await requireAuth();
  requireRole(user, 'platform_admin');

  const [updated] = await db
    .update(priceChangeRequests)
    .set({
      status: 'approved',
      reviewed_by: user.id,
      reviewed_at: new Date(),
      updated_at: new Date(),
    })
    .where(eq(priceChangeRequests.id, requestId))
    .returning();

  revalidatePath('/admin');
  return updated;
}

export async function rejectPricingRequest(requestId: string, note: string) {
  const user = await requireAuth();
  requireRole(user, 'platform_admin');

  const [updated] = await db
    .update(priceChangeRequests)
    .set({
      status: 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date(),
      admin_note: note,
      updated_at: new Date(),
    })
    .where(eq(priceChangeRequests.id, requestId))
    .returning();

  revalidatePath('/admin');
  return updated;
}
