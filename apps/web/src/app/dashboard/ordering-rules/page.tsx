"use client";

import { useEffect, useState } from "react";
import { Plus, ListChecks, Sparkles } from "lucide-react";
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
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-on-surface font-headline">Sipariş Kuralları</h1>
            {!isLoading && rules.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-fixed text-primary-dark">
                {rules.length} kural
              </span>
            )}
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            Otomatik pasta siparişleri için kurallar tanımlayın.
          </p>
        </div>
        <Button
          onClick={() => { setEditTarget(null); setFormOpen(true); }}
          className="rounded-xl gradient-primary text-white shrink-0 shadow-[0_10px_20px_-5px_rgba(157,67,0,0.3)]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Yeni Kural
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : rules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-surface-lowest rounded-2xl border border-outline-variant/30 shadow-sm">
          <div className="h-20 w-20 rounded-2xl bg-primary-fixed flex items-center justify-center mb-5">
            <ListChecks className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-on-surface mb-2">Henüz kural tanımlanmadı</h3>
          <p className="text-sm text-on-surface-variant max-w-sm mb-6 leading-relaxed">
            Çalışan doğum günlerinde otomatik pasta sipariş verilmesi için kural tanımlayın. Kurallar sayesinde hiçbir doğum gününü kaçırmayın.
          </p>
          <Button
            onClick={() => { setEditTarget(null); setFormOpen(true); }}
            className="rounded-xl gradient-primary text-white shadow-[0_10px_20px_-5px_rgba(157,67,0,0.3)]"
          >
            <Plus className="mr-2 h-4 w-4" />
            İlk Kuralı Oluştur
          </Button>
        </div>
      ) : (
        <>
          {/* Info banner */}
          <div className="flex items-center gap-3 bg-primary-fixed rounded-xl p-4 border border-primary/20">
            <Sparkles className="h-5 w-5 text-primary shrink-0" />
            <p className="text-sm text-primary-dark">
              <strong>{rules.filter(r => r.is_active).length} aktif kural</strong> otomatik sipariş sürecinizi yönetiyor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </>
      )}

      <RuleForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        rule={editTarget}
      />

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-on-surface">Kuralı Sil</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-on-surface-variant">
            <strong className="text-on-surface">{deleteTarget?.name}</strong> kuralını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="flex-1 rounded-xl border-outline-variant">
              İptal
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} className="flex-1 rounded-xl">
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
