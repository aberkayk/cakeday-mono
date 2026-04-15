'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth, requireRole, requireCompanyUser } from '@/lib/auth';
import { orderService } from '@/lib/services/order.service';
import type { CreateAdHocOrderInput, CancelOrderInput, District } from '@/lib/shared';

export async function createOrder(formData: FormData) {
  const user = await requireAuth();
  requireRole(user, 'company_owner', 'hr_manager', 'platform_admin');
  const companyId = requireCompanyUser(user);

  const input: CreateAdHocOrderInput = {
    employee_id: (formData.get('employee_id') as string) || undefined,
    recipient_name: formData.get('recipient_name') as string,
    recipient_phone: (formData.get('recipient_phone') as string) || undefined,
    delivery_date: formData.get('delivery_date') as string,
    delivery_address: formData.get('delivery_address') as string,
    delivery_district: formData.get('delivery_district') as District,
    delivery_window: (formData.get('delivery_window') as 'morning' | 'afternoon' | 'no_preference') || undefined,
    cake_type_id: formData.get('cake_type_id') as string,
    cake_size: formData.get('cake_size') as 'small' | 'medium' | 'large',
    custom_text: (formData.get('custom_text') as string) || undefined,
  };

  const result = await orderService.createAdHocOrder(companyId, user.id, input);
  revalidatePath('/dashboard/orders');
  return result;
}

export async function cancelOrder(orderId: string, reason?: string) {
  const user = await requireAuth();
  requireRole(user, 'company_owner', 'hr_manager', 'platform_admin');
  const companyId = requireCompanyUser(user);

  const input: CancelOrderInput = { reason };

  const result = await orderService.cancelOrder(companyId, orderId, user.id, user.role, input);
  revalidatePath('/dashboard/orders');
  return result;
}
