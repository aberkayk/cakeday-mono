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
  "bg-accent/20 text-accent-foreground",
  "bg-primary/20 text-primary",
  "bg-background-secondary text-foreground",
  "bg-accent text-accent-foreground",
  "bg-primary/10 text-primary",
  "bg-background-secondary/80 text-muted-foreground",
  "bg-accent/40 text-accent-foreground",
  "bg-primary text-primary-foreground",
];

const DEPT_COLORS: Record<string, string> = {
  Mühendislik: "bg-background-secondary text-muted-foreground",
  Pazarlama: "bg-accent/20 text-accent-foreground",
  Satış: "bg-background-secondary text-muted-foreground",
  İnsan: "bg-primary/10 text-primary",
  Finans: "bg-accent/10 text-accent-foreground",
  Tasarım: "bg-primary/5 text-primary",
};

function getDeptColor(dept: string | null | undefined): string {
  if (!dept) return "bg-background-secondary text-muted";
  const match = Object.keys(DEPT_COLORS).find((k) => dept.toLowerCase().includes(k.toLowerCase()));
  return match ? DEPT_COLORS[match] : "bg-background-secondary text-muted";
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <Input
              placeholder="Ad, soyad veya e-posta ara..."
              className="pl-9 rounded-xl border-border-soft focus:border-primary bg-background"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter ?? "all"}
            onValueChange={(v) => onStatusChange(v === "all" ? undefined : v)}
          >
            <SelectTrigger className="w-40 rounded-xl border-border-soft bg-background">
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
          <Button variant="outline" asChild className="rounded-xl border-border-soft text-foreground hover:bg-background-secondary">
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
      <div className="bg-background rounded-2xl border border-border-soft shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-background-secondary/80 hover:bg-background-secondary/80">
              <TableHead className="text-xs font-semibold text-muted uppercase tracking-wider">Ad Soyad</TableHead>
              <TableHead className="text-xs font-semibold text-muted uppercase tracking-wider">Doğum Günü</TableHead>
              <TableHead className="text-xs font-semibold text-muted uppercase tracking-wider">Departman</TableHead>
              <TableHead className="text-xs font-semibold text-muted uppercase tracking-wider">İlçe</TableHead>
              <TableHead className="text-xs font-semibold text-muted uppercase tracking-wider">Durum</TableHead>
              <TableHead className="w-24 text-right text-xs font-semibold text-muted uppercase tracking-wider">İşlemler</TableHead>
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
                    <div className="h-16 w-16 rounded-2xl bg-background-secondary flex items-center justify-center mb-4">
                      <Users className="h-8 w-8 text-muted/40" />
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">
                      {search ? "Sonuç bulunamadı" : "Henüz çalışan eklenmemiş"}
                    </p>
                    <p className="text-xs text-muted mb-4">
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
                  <TableRow key={employee.id} className="hover:bg-background-secondary/50 border-border-soft/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className={`${colorClass} font-semibold text-xs`}>
                            {getInitials(`${employee.first_name} ${employee.last_name}`)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {employee.first_name} {employee.last_name}
                          </p>
                          {employee.work_email && (
                            <p className="text-xs text-muted">{employee.work_email}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted">
                      {formatBirthday(employee.date_of_birth)}
                    </TableCell>
                    <TableCell>
                      {employee.department ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDeptColor(employee.department)}`}>
                          {employee.department}
                        </span>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted">
                      {employee.delivery_district
                        ? DISTRICT_LABELS[employee.delivery_district] ?? employee.delivery_district
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          employee.status === "active"
                            ? "bg-accent/10 text-accent-foreground"
                            : "bg-background-secondary text-muted-foreground"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${employee.status === "active" ? "bg-primary" : "bg-muted-foreground/30"}`} />
                        {employee.status === "active" ? "Aktif" : "Pasif"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-background-secondary text-muted hover:text-foreground"
                          onClick={() => onEdit(employee)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-red-50 text-muted/60 hover:text-red-500"
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
          <p className="text-sm text-muted">
            <span className="font-medium text-foreground">{Math.min((page - 1) * pageSize + 1, totalCount)}–{Math.min(page * pageSize, totalCount)}</span>
            {" "}/ {totalCount} çalışan
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="rounded-xl border-border-soft h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium text-muted px-1">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="rounded-xl border-border-soft h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
