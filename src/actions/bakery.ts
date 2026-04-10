'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth, requireBakeryUser } from '@/lib/auth';
import { bakeryService } from '@/lib/services/bakery.service';
import type { SubmitPriceRequestInput } from '@/lib/shared';

export async function acceptOrder(orderId: string) {
  const user = await requireAuth();
  const bakeryId = requireBakeryUser(user);

  const result = await bakeryService.acceptOrder(bakeryId, orderId, user.id, user.role);
  revalidatePath('/bakery/orders');
  return result;
}

export async function rejectOrder(orderId: string, reason: string) {
  const user = await requireAuth();
  const bakeryId = requireBakeryUser(user);

  const result = await bakeryService.rejectOrder(bakeryId, orderId, user.id, user.role, reason);
  revalidatePath('/bakery/orders');
  return result;
}

export async function markDelivered(orderId: string) {
  const user = await requireAuth();
  const bakeryId = requireBakeryUser(user);

  const result = await bakeryService.markDelivered(bakeryId, orderId, user.id, user.role);
  revalidatePath('/bakery/orders');
  return result;
}

export async function requestPriceChange(data: SubmitPriceRequestInput) {
  const user = await requireAuth();
  requireBakeryUser(user);

  // TODO: implement in service
  void data;
  return { message: 'Fiyat degisikligi talebi gonderildi.' };
}
