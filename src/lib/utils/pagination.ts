import type { PaginationMeta } from '@/lib/shared';

export interface PaginationParams {
  page: number;
  pageSize: number;
  offset: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
}

export function buildMeta(
  page: number,
  pageSize: number,
  totalCount: number,
): PaginationMeta {
  return {
    page,
    pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}
