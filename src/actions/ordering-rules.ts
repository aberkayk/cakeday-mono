'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth, requireRole, requireCompanyUser } from '@/lib/auth';
import { orderingRuleService } from '@/lib/services/ordering-rule.service';
import type { CreateOrderingRuleInput, UpdateOrderingRuleInput } from '@/lib/shared';

export async function createRule(data: CreateOrderingRuleInput) {
  const user = await requireAuth();
  requireRole(user, 'company_owner', 'hr_manager', 'platform_admin');
  const companyId = requireCompanyUser(user);

  const result = await orderingRuleService.createRule(companyId, user.id, data);
  revalidatePath('/dashboard/ordering-rules');
  return result;
}

export async function updateRule(id: string, data: UpdateOrderingRuleInput) {
  const user = await requireAuth();
  requireRole(user, 'company_owner', 'hr_manager', 'platform_admin');
  const companyId = requireCompanyUser(user);

  const result = await orderingRuleService.updateRule(companyId, id, data);
  revalidatePath('/dashboard/ordering-rules');
  return result;
}

export async function deleteRule(id: string) {
  const user = await requireAuth();
  requireRole(user, 'company_owner', 'hr_manager', 'platform_admin');
  const companyId = requireCompanyUser(user);

  const result = await orderingRuleService.deleteRule(companyId, id);
  revalidatePath('/dashboard/ordering-rules');
  return result;
}
