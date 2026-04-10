'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth, requireRole, requireCompanyUser } from '@/lib/auth';
import { employeeService } from '@/lib/services/employee.service';
import type { CreateEmployeeInput, UpdateEmployeeInput } from '@/lib/shared';

export async function createEmployee(formData: FormData) {
  const user = await requireAuth();
  requireRole(user, 'company_owner', 'hr_manager', 'platform_admin');
  const companyId = requireCompanyUser(user);

  const input: CreateEmployeeInput = {
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    date_of_birth: formData.get('date_of_birth') as string,
    start_date: (formData.get('start_date') as string) || undefined,
    department: (formData.get('department') as string) || undefined,
    office_location: (formData.get('office_location') as string) || undefined,
    delivery_address: (formData.get('delivery_address') as string) || undefined,
    delivery_district: (formData.get('delivery_district') as string) || undefined,
    personal_email: (formData.get('personal_email') as string) || undefined,
    work_email: (formData.get('work_email') as string) || undefined,
  };

  const result = await employeeService.createEmployee(companyId, input);
  revalidatePath('/dashboard/employees');
  return result;
}

export async function updateEmployee(id: string, formData: FormData) {
  const user = await requireAuth();
  requireRole(user, 'company_owner', 'hr_manager', 'platform_admin');
  const companyId = requireCompanyUser(user);

  const input: UpdateEmployeeInput = {
    first_name: (formData.get('first_name') as string) || undefined,
    last_name: (formData.get('last_name') as string) || undefined,
    date_of_birth: (formData.get('date_of_birth') as string) || undefined,
    start_date: (formData.get('start_date') as string) || undefined,
    department: (formData.get('department') as string) || undefined,
    office_location: (formData.get('office_location') as string) || undefined,
    delivery_address: (formData.get('delivery_address') as string) || undefined,
    delivery_district: (formData.get('delivery_district') as string) || undefined,
    personal_email: (formData.get('personal_email') as string) || undefined,
    work_email: (formData.get('work_email') as string) || undefined,
  };

  const result = await employeeService.updateEmployee(companyId, id, input);
  revalidatePath('/dashboard/employees');
  return result;
}

export async function deleteEmployee(id: string, confirmName: string) {
  const user = await requireAuth();
  requireRole(user, 'company_owner', 'hr_manager', 'platform_admin');
  const companyId = requireCompanyUser(user);

  const result = await employeeService.deleteEmployee(companyId, id, confirmName);
  revalidatePath('/dashboard/employees');
  return result;
}
