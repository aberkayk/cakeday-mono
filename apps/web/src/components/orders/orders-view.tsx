"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderList } from "@/components/orders/order-list";
import { useOrders } from "@/hooks/use-orders";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Order } from "@cakeday/shared";

const TABS = [
  { value: "upcoming", label: "Yaklaşan", statuses: ["draft", "pending_approval", "confirmed"], color: "bg-blue-50 text-blue-700" },
  { value: "active", label: "Aktif", statuses: ["assigned", "accepted", "preparing", "out_for_delivery"], color: "bg-primary/20 text-primary" },
  { value: "completed", label: "Tamamlanan", statuses: ["delivered"], color: "bg-green-50 text-green-700" },
  { value: "cancelled", label: "İptal", statuses: ["cancelled", "rejected", "failed"], color: "bg-background-secondary text-muted" },
];

export function OrdersView() {
  const { orders, isLoading, fetchOrders, cancelOrder } = useOrders();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders({ pageSize: 100 });
  }, []);

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    try {
      await cancelOrder(cancelTarget.id);
      toast({ title: "Sipariş iptal edildi." });
      fetchOrders({ pageSize: 100 });
      setCancelTarget(null);
    } catch (err) {
      toast({
        title: "Hata",
        description: err instanceof Error ? err.message : "İptal başarısız.",
        variant: "destructive",
      });
    }
  };

  const filteredOrders = (statuses: string[]) =>
    orders.filter((o) => statuses.includes(o.status));

  const activeTabConfig = TABS.find((t) => t.value === activeTab)!;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground font-headline">Siparişler</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary">
              {orders.length} toplam
            </span>
          </div>
          <p className="text-sm text-muted mt-1">
            Tüm sipariş geçmişini ve durumlarını görüntüleyin.
          </p>
        </div>
        <Button asChild size="lg" className="shrink-0">
          <Link href="/dashboard/orders/new">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Sipariş
          </Link>
        </Button>
      </div>

      {/* Custom Tab Nav */}
      <div className="bg-background rounded-2xl shadow-sm border border-border-soft/30 overflow-hidden">
        <div className="flex items-center gap-1 p-1.5 border-b border-border-soft/20 bg-background-secondary/50">
          {TABS.map((tab) => {
            const count = filteredOrders(tab.statuses).length;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted hover:text-foreground hover:bg-background/60"
                }`}
              >
                {tab.label}
                <span className={`inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-xs font-bold ${
                  isActive ? tab.color : "bg-background-secondary text-muted"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-5">
          <OrderList
            orders={filteredOrders(activeTabConfig.statuses)}
            isLoading={isLoading}
            onCancel={activeTab === "upcoming" ? setCancelTarget : undefined}
            emptyMessage={
              activeTab === "upcoming"
                ? "Yaklaşan sipariş yok."
                : activeTab === "active"
                ? "Aktif sipariş yok."
                : activeTab === "completed"
                ? "Tamamlanan sipariş yok."
                : "İptal edilen sipariş yok."
            }
          />
        </div>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={!!cancelTarget} onOpenChange={() => setCancelTarget(null)}>
        <DialogContent className="max-w-sm rounded-2xl border-0 shadow-ambient">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <ShoppingBag className="h-5 w-5 text-red-500" />
              </div>
              <DialogTitle className="text-base font-bold text-foreground">Siparişi İptal Et</DialogTitle>
            </div>
          </DialogHeader>
          <p className="text-sm text-muted">
            <strong className="text-foreground">{cancelTarget?.recipient_name}</strong> için verilen siparişi iptal etmek istediğinizden emin misiniz?
          </p>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setCancelTarget(null)} className="flex-1 rounded-xl">
              Vazgeç
            </Button>
            <Button variant="destructive" onClick={handleCancelConfirm} className="flex-1 rounded-xl">
              İptal Et
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
