'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth, requireSupplierUser } from '@/lib/auth';
import { supplierService } from '@/lib/services/supplier.service';
import type { SubmitPriceRequestInput } from '@/lib/shared';

export async function acceptOrder(orderId: string) {
  const user = await requireAuth();
  const supplierId = requireSupplierUser(user);

  const result = await supplierService.acceptOrder(supplierId, orderId, user.id, user.role);
  revalidatePath('/supplier/orders');
  return result;
}

export async function rejectOrder(orderId: string, reason: string) {
  const user = await requireAuth();
  const supplierId = requireSupplierUser(user);

  const result = await supplierService.rejectOrder(supplierId, orderId, user.id, user.role, reason);
  revalidatePath('/supplier/orders');
  return result;
}

export async function markDelivered(orderId: string) {
  const user = await requireAuth();
  const supplierId = requireSupplierUser(user);

  const result = await supplierService.markDelivered(supplierId, orderId, user.id, user.role);
  revalidatePath('/supplier/orders');
  return result;
}

export async function requestPriceChange(data: SubmitPriceRequestInput) {
  const user = await requireAuth();
  requireSupplierUser(user);

  // TODO: implement in service
  void data;
  return { message: 'Fiyat degisikligi talebi gonderildi.' };
}
