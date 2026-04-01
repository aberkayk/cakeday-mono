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
import { Loader2 } from "lucide-react";
import { useEmployees } from "@/hooks/use-employees";
import type { Employee } from "@cakeday/shared";

export default function EmployeesPage() {
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Çalışanlar</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Şirketinizdeki tüm çalışanları yönetin.
        </p>
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

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Çalışanı Sil</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            <strong>{deleteTarget?.first_name} {deleteTarget?.last_name}</strong> adlı çalışanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              İptal
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
