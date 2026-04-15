import type { UserRole } from './enums';

export const PERMISSIONS = {
  'companies:read': [
    'company_owner',
    'hr_manager',
    'finance',
    'viewer',
    'platform_admin',
  ] as UserRole[],
  'companies:write': ['company_owner', 'platform_admin'] as UserRole[],
  'employees:read': [
    'company_owner',
    'hr_manager',
    'viewer',
    'platform_admin',
  ] as UserRole[],
  'employees:write': ['company_owner', 'hr_manager', 'platform_admin'] as UserRole[],
  'orders:read': [
    'company_owner',
    'hr_manager',
    'finance',
    'viewer',
    'platform_admin',
  ] as UserRole[],
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
