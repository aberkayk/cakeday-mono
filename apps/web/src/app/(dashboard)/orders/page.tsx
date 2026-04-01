"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Button as Btn } from "@/components/ui/button";
import type { Order } from "@cakeday/shared";

const TABS = [
  { value: "upcoming", label: "Yaklaşan", statuses: ["draft", "pending_approval", "confirmed"] },
  { value: "active", label: "Aktif", statuses: ["assigned", "accepted", "preparing", "out_for_delivery"] },
  { value: "completed", label: "Tamamlanan", statuses: ["delivered"] },
  { value: "cancelled", label: "İptal", statuses: ["cancelled", "rejected", "failed"] },
];

export default function OrdersPage() {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Siparişler</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Tüm sipariş geçmişini ve durumlarını görüntüleyin.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/orders/new">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Sipariş
          </Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
              <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium">
                {filteredOrders(tab.statuses).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            <OrderList
              orders={filteredOrders(tab.statuses)}
              isLoading={isLoading}
              onCancel={tab.value === "upcoming" ? setCancelTarget : undefined}
              emptyMessage={
                tab.value === "upcoming"
                  ? "Yaklaşan sipariş yok."
                  : tab.value === "active"
                  ? "Aktif sipariş yok."
                  : tab.value === "completed"
                  ? "Tamamlanan sipariş yok."
                  : "İptal edilen sipariş yok."
              }
            />
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={!!cancelTarget} onOpenChange={() => setCancelTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Siparişi İptal Et</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            <strong>{cancelTarget?.recipient_name}</strong> için verilen siparişi iptal etmek istediğinizden emin misiniz?
          </p>
          <DialogFooter>
            <Btn variant="outline" onClick={() => setCancelTarget(null)}>Vazgeç</Btn>
            <Btn variant="destructive" onClick={handleCancelConfirm}>İptal Et</Btn>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
