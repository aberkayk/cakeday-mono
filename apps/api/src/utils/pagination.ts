import type { Request } from 'express';
import type { PaginationMeta } from '@cakeday/shared';

export interface PaginationParams {
  page: number;
  pageSize: number;
  offset: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
}

export function parsePagination(req: Request, defaultSort = 'created_at'): PaginationParams {
  const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(String(req.query.pageSize ?? '25'), 10) || 25),
  );
  const sort = String(req.query.sort ?? defaultSort);
  const order = req.query.order === 'asc' ? 'asc' : 'desc';
  const search = req.query.search ? String(req.query.search) : undefined;

  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize,
    sort,
    order,
    search,
  };
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
