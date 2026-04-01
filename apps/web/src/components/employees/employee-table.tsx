"use client";

import { useState } from "react";
import { Search, Plus, Pencil, Trash2, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatBirthday, DISTRICT_LABELS } from "@/lib/utils";
import type { Employee } from "@cakeday/shared";
import Link from "next/link";

interface EmployeeTableProps {
  employees: Employee[];
  totalCount: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  search: string;
  statusFilter: string | undefined;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string | undefined) => void;
  onPageChange: (page: number) => void;
  onAdd: () => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export function EmployeeTable({
  employees,
  totalCount,
  page,
  pageSize,
  isLoading,
  search,
  statusFilter,
  onSearchChange,
  onStatusChange,
  onPageChange,
  onAdd,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ad, soyad veya e-posta ara..."
              className="pl-9"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter ?? "all"}
            onValueChange={(v) => onStatusChange(v === "all" ? undefined : v)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Pasif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/employees/import">
              <Upload className="mr-2 h-4 w-4" />
              CSV Yükle
            </Link>
          </Button>
          <Button onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Çalışan Ekle
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Ad Soyad</TableHead>
              <TableHead>Doğum Günü</TableHead>
              <TableHead>Departman</TableHead>
              <TableHead>İlçe</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="w-24 text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(6)].map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <p className="text-muted-foreground text-sm">
                    {search ? "Arama sonucu bulunamadı." : "Henüz çalışan eklenmemiş."}
                  </p>
                  {!search && (
                    <Button size="sm" className="mt-3" onClick={onAdd}>
                      <Plus className="mr-2 h-4 w-4" />
                      İlk Çalışanı Ekle
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-muted/20">
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">
                        {employee.first_name} {employee.last_name}
                      </p>
                      {employee.work_email && (
                        <p className="text-xs text-muted-foreground">{employee.work_email}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatBirthday(employee.date_of_birth)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {employee.department ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {employee.delivery_district
                      ? DISTRICT_LABELS[employee.delivery_district] ?? employee.delivery_district
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={employee.status === "active" ? "default" : "secondary"}
                      className={
                        employee.status === "active"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                      }
                    >
                      {employee.status === "active" ? "Aktif" : "Pasif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(employee)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onDelete(employee)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {totalCount} çalışandan {Math.min((page - 1) * pageSize + 1, totalCount)}–
            {Math.min(page * pageSize, totalCount)} gösteriliyor
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
