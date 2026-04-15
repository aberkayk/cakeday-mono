'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth, requireRole, requireCompanyUser } from '@/lib/auth';
import { companyService } from '@/lib/services/company.service';
import type {
  UpdateCompanyProfileInput,
  UpdateCompanySettingsInput,
} from '@/lib/shared';

export async function updateCompanyProfile(data: UpdateCompanyProfileInput) {
  const user = await requireAuth();
  requireRole(user, 'company_owner');
  const companyId = requireCompanyUser(user);

  const result = await companyService.updateCompany(companyId, data);
  revalidatePath('/dashboard/settings');
  return result;
}

export async function updateCompanySettings(data: UpdateCompanySettingsInput) {
  const user = await requireAuth();
  requireRole(user, 'company_owner');
  const companyId = requireCompanyUser(user);

  const result = await companyService.updateCompanySettings(companyId, data);
  revalidatePath('/dashboard/settings');
  return result;
}
