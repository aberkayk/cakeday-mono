"use client";

import { useState, useCallback } from "react";
import { employeesApi } from "@/lib/api";
import type { Employee } from "@cakeday/shared";

interface UseEmployeesOptions {
  initialPage?: number;
  pageSize?: number;
}

export function useEmployees(options: UseEmployeesOptions = {}) {
  const { initialPage = 1, pageSize = 20 } = options;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [departmentFilter, setDepartmentFilter] = useState<string | undefined>(undefined);

  const fetchEmployees = useCallback(
    async (opts?: { page?: number; search?: string; status?: string; department?: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await employeesApi.list({
          page: opts?.page ?? page,
          pageSize,
          search: (opts?.search ?? search) || undefined,
          status: opts?.status ?? statusFilter,
          department: opts?.department ?? departmentFilter,
        });
        setEmployees(res.data);
        setTotalCount(res.meta.totalCount);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Çalışanlar yüklenemedi.");
      } finally {
        setIsLoading(false);
      }
    },
    [page, pageSize, search, statusFilter, departmentFilter]
  );

  const createEmployee = useCallback(async (data: Partial<Employee>) => {
    const res = await employeesApi.create(data);
    return res.data;
  }, []);

  const updateEmployee = useCallback(async (id: string, data: Partial<Employee>) => {
    const res = await employeesApi.update(id, data);
    return res.data;
  }, []);

  const deleteEmployee = useCallback(async (id: string) => {
    await employeesApi.delete(id);
  }, []);

  return {
    employees,
    totalCount,
    page,
    pageSize,
    isLoading,
    error,
    search,
    statusFilter,
    departmentFilter,
    setPage,
    setSearch,
    setStatusFilter,
    setDepartmentFilter,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
}
