"use client";

import { useEffect, useState } from "react";
import { Plus, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useOrderingRules } from "@/hooks/use-ordering-rules";
import { RuleCard } from "@/components/rules/rule-card";
import { RuleForm } from "@/components/rules/rule-form";
import { useToast } from "@/hooks/use-toast";
import type { OrderingRule } from "@cakeday/shared";

export default function OrderingRulesPage() {
  const { rules, isLoading, fetchRules, createRule, updateRule, deleteRule } = useOrderingRules();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<OrderingRule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OrderingRule | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRules();
  }, []);

  const handleSubmit = async (data: Partial<OrderingRule>) => {
    try {
      if (editTarget) {
        await updateRule(editTarget.id, data);
        toast({ title: "Kural güncellendi." });
      } else {
        await createRule(data);
        toast({ title: "Kural oluşturuldu." });
      }
      fetchRules();
    } catch (err) {
      toast({
        title: "Hata",
        description: err instanceof Error ? err.message : "İşlem başarısız.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const handleToggle = async (rule: OrderingRule, active: boolean) => {
    try {
      await updateRule(rule.id, { is_active: active });
      fetchRules();
    } catch {
      toast({ title: "Durum güncellenemedi.", variant: "destructive" });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRule(deleteTarget.id);
      toast({ title: "Kural silindi." });
      fetchRules();
      setDeleteTarget(null);
    } catch (err) {
      toast({
        title: "Hata",
        description: err instanceof Error ? err.message : "Silme başarısız.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sipariş Kuralları</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Otomatik pasta siparişleri için kurallar tanımlayın.
          </p>
        </div>
        <Button onClick={() => { setEditTarget(null); setFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Kural
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : rules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ListChecks className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-lg mb-2">Henüz kural yok</h3>
          <p className="text-muted-foreground text-sm max-w-sm mb-4">
            Çalışan doğum günlerinde otomatik pasta sipariş verilmesi için kural tanımlayın.
          </p>
          <Button onClick={() => { setEditTarget(null); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            İlk Kuralı Oluştur
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onEdit={(r) => { setEditTarget(r); setFormOpen(true); }}
              onDelete={setDeleteTarget}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      <RuleForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        rule={editTarget}
      />

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Kuralı Sil</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            <strong>{deleteTarget?.name}</strong> kuralını silmek istediğinizden emin misiniz?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>İptal</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Sil</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
