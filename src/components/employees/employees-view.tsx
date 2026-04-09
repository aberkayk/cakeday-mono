"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { EmployeeTable } from "@/components/employees/employee-table";
import { EmployeeForm } from "@/components/employees/employee-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { useEmployees } from "@/hooks/use-employees";
import type { Employee } from "@cakeday/shared";

export function EmployeesView() {
  const {
    employees,
    totalCount,
    page,
    pageSize,
    isLoading,
    search,
    statusFilter,
    setPage,
    setSearch,
    setStatusFilter,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  } = useEmployees({ pageSize: 20 });

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchEmployees(); }, [page, search, statusFilter]);

  const handleAdd = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditTarget(employee);
    setFormOpen(true);
  };

  const handleSubmit = async (data: Partial<Employee>) => {
    try {
      if (editTarget) {
        await updateEmployee(editTarget.id, data);
        toast({ title: "Çalışan güncellendi." });
      } else {
        await createEmployee(data);
        toast({ title: "Çalışan eklendi." });
      }
      fetchEmployees();
    } catch (err) {
      toast({
        title: "Hata",
        description: err instanceof Error ? err.message : "İşlem başarısız.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteEmployee(deleteTarget.id);
      toast({ title: "Çalışan silindi." });
      fetchEmployees();
      setDeleteTarget(null);
    } catch (err) {
      toast({
        title: "Hata",
        description: err instanceof Error ? err.message : "Silme işlemi başarısız.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground font-headline">Çalışanlar</h1>
            {!isLoading && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary">
                {totalCount} kişi
              </span>
            )}
          </div>
          <p className="text-sm text-muted mt-1">
            Şirketinizdeki tüm çalışanları yönetin.
          </p>
        </div>
      </div>

      <EmployeeTable
        employees={employees}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        search={search}
        statusFilter={statusFilter}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        onStatusChange={(v) => { setStatusFilter(v); setPage(1); }}
        onPageChange={setPage}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
      />

      <EmployeeForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        employee={editTarget}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm rounded-2xl border-0 shadow-ambient">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <DialogTitle className="text-base">Çalışanı Sil</DialogTitle>
            </div>
          </DialogHeader>
          <p className="text-sm text-muted">
            <strong className="text-foreground">{deleteTarget?.first_name} {deleteTarget?.last_name}</strong> adlı çalışanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </p>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="flex-1 rounded-xl">
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="flex-1 rounded-xl"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
