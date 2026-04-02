"use client";

import { Search, Plus, Pencil, Trash2, Upload, ChevronLeft, ChevronRight, Users } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatBirthday, DISTRICT_LABELS, getInitials } from "@/lib/utils";
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

const AVATAR_COLORS = [
  "bg-surface-container-high text-on-surface",
  "bg-tertiary-container/40 text-tertiary",
  "bg-surface-container text-on-surface-variant",
  "bg-primary-fixed text-on-primary-fixed-variant",
  "bg-secondary-container/30 text-secondary",
  "bg-tertiary-container/20 text-on-tertiary-container",
  "bg-surface-container-high text-on-surface",
  "bg-primary-fixed/60 text-primary",
];

const DEPT_COLORS: Record<string, string> = {
  Mühendislik: "bg-surface-container text-on-surface-variant",
  Pazarlama: "bg-tertiary-container/30 text-tertiary",
  Satış: "bg-surface-container-low text-on-surface-variant",
  İnsan: "bg-primary-fixed text-on-primary-fixed-variant",
  Finans: "bg-tertiary-container/20 text-on-tertiary-container",
  Tasarım: "bg-secondary-container/20 text-secondary",
};

function getDeptColor(dept: string | null | undefined): string {
  if (!dept) return "bg-surface-container text-on-surface-variant";
  const match = Object.keys(DEPT_COLORS).find((k) => dept.toLowerCase().includes(k.toLowerCase()));
  return match ? DEPT_COLORS[match] : "bg-surface-container text-on-surface-variant";
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
  const startIdx = (page - 1) * pageSize;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
            <Input
              placeholder="Ad, soyad veya e-posta ara..."
              className="pl-9 rounded-xl border-outline-variant focus:border-primary bg-surface-container-lowest"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter ?? "all"}
            onValueChange={(v) => onStatusChange(v === "all" ? undefined : v)}
          >
            <SelectTrigger className="w-40 rounded-xl border-outline-variant bg-surface-container-lowest">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Pasif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild className="rounded-xl border-outline-variant text-on-surface hover:bg-surface-container-low">
            <Link href="/dashboard/employees/import">
              <Upload className="mr-2 h-4 w-4" />
              CSV Yükle
            </Link>
          </Button>
          <Button onClick={onAdd} className="rounded-xl gradient-primary text-white shadow-primary">
            <Plus className="mr-2 h-4 w-4" />
            Çalışan Ekle
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-container-low/80 hover:bg-surface-container-low/80">
              <TableHead className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Ad Soyad</TableHead>
              <TableHead className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Doğum Günü</TableHead>
              <TableHead className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Departman</TableHead>
              <TableHead className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">İlçe</TableHead>
              <TableHead className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Durum</TableHead>
              <TableHead className="w-24 text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wider">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-3 w-36" />
                      </div>
                    </div>
                  </TableCell>
                  {[...Array(5)].map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full max-w-[80px]" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="h-16 w-16 rounded-2xl bg-surface-container-low flex items-center justify-center mb-4">
                      <Users className="h-8 w-8 text-on-surface-variant/40" />
                    </div>
                    <p className="text-sm font-semibold text-on-surface mb-1">
                      {search ? "Sonuç bulunamadı" : "Henüz çalışan eklenmemiş"}
                    </p>
                    <p className="text-xs text-on-surface-variant mb-4">
                      {search ? `"${search}" için eşleşme yok.` : "İlk çalışanınızı ekleyerek başlayın."}
                    </p>
                    {!search && (
                      <Button size="sm" onClick={onAdd} className="rounded-xl gradient-primary text-white shadow-primary">
                        <Plus className="mr-2 h-4 w-4" />
                        İlk Çalışanı Ekle
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee, idx) => {
                const colorClass = AVATAR_COLORS[(startIdx + idx) % AVATAR_COLORS.length];
                return (
                  <TableRow key={employee.id} className="hover:bg-surface-container-low/50 border-outline-variant/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className={`${colorClass} font-semibold text-xs`}>
                            {getInitials(`${employee.first_name} ${employee.last_name}`)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-on-surface">
                            {employee.first_name} {employee.last_name}
                          </p>
                          {employee.work_email && (
                            <p className="text-xs text-on-surface-variant">{employee.work_email}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-on-surface-variant">
                      {formatBirthday(employee.date_of_birth)}
                    </TableCell>
                    <TableCell>
                      {employee.department ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDeptColor(employee.department)}`}>
                          {employee.department}
                        </span>
                      ) : (
                        <span className="text-xs text-on-surface-variant">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-on-surface-variant">
                      {employee.delivery_district
                        ? DISTRICT_LABELS[employee.delivery_district] ?? employee.delivery_district
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          employee.status === "active"
                            ? "bg-surface-container text-on-surface-variant"
                            : "bg-surface-container-high text-on-surface-variant"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${employee.status === "active" ? "bg-tertiary" : "bg-on-surface-variant/40"}`} />
                        {employee.status === "active" ? "Aktif" : "Pasif"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface"
                          onClick={() => onEdit(employee)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-red-50 text-on-surface-variant/60 hover:text-red-500"
                          onClick={() => onDelete(employee)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-on-surface-variant">
            <span className="font-medium text-on-surface">{Math.min((page - 1) * pageSize + 1, totalCount)}–{Math.min(page * pageSize, totalCount)}</span>
            {" "}/ {totalCount} çalışan
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="rounded-xl border-outline-variant h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium text-on-surface-variant px-1">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="rounded-xl border-outline-variant h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
