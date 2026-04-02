"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BakeryOrderCard } from "@/components/bakery/bakery-order-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag } from "lucide-react";
import { useBakeryOrders } from "@/hooks/use-orders";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@cakeday/shared";

const TABS = [
  { value: "new", label: "Yeni", statuses: ["assigned"] },
  { value: "accepted", label: "Kabul Edilen", statuses: ["accepted", "preparing"] },
  { value: "delivering", label: "Teslimat", statuses: ["out_for_delivery"] },
  { value: "delivered", label: "Teslim Edildi", statuses: ["delivered"] },
  { value: "rejected", label: "Reddedilen", statuses: ["rejected"] },
];

export default function BakeryOrdersPage() {
  const { orders, isLoading, fetchOrders, acceptOrder, rejectOrder, markDelivered } = useBakeryOrders();
  const [activeTab, setActiveTab] = useState("new");
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders({ pageSize: 100 });
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await acceptOrder(id);
      toast({ title: "Sipariş kabul edildi." });
      fetchOrders({ pageSize: 100 });
    } catch (err) {
      toast({ title: "Hata", description: err instanceof Error ? err.message : "Kabul başarısız.", variant: "destructive" });
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await rejectOrder(id, reason);
      toast({ title: "Sipariş reddedildi." });
      fetchOrders({ pageSize: 100 });
    } catch (err) {
      toast({ title: "Hata", description: err instanceof Error ? err.message : "Reddetme başarısız.", variant: "destructive" });
    }
  };

  const handleDeliver = async (id: string) => {
    try {
      await markDelivered(id);
      toast({ title: "Sipariş teslim edildi olarak işaretlendi." });
      fetchOrders({ pageSize: 100 });
    } catch (err) {
      toast({ title: "Hata", description: err instanceof Error ? err.message : "Güncelleme başarısız.", variant: "destructive" });
    }
  };

  const filteredOrders = (statuses: string[]) => orders.filter((o) => statuses.includes(o.status));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline text-on-surface">Siparişler</h1>
        <p className="text-on-surface-variant text-sm mt-1">Gelen siparişleri kabul edin, hazırlayın ve teslim edin.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
              <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-surface-container-high px-1.5 text-xs font-medium text-on-surface-variant">
                {filteredOrders(tab.statuses).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((tab) => {
          const tabOrders = filteredOrders(tab.statuses);
          return (
            <TabsContent key={tab.value} value={tab.value} className="mt-4">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
                </div>
              ) : tabOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ShoppingBag className="h-14 w-14 text-on-surface-variant/30 mb-3" />
                  <p className="text-on-surface-variant text-sm">Bu kategoride sipariş yok.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tabOrders.map((order: Order) => (
                    <BakeryOrderCard
                      key={order.id}
                      order={order}
                      onAccept={tab.value === "new" ? handleAccept : undefined}
                      onReject={["new", "accepted"].includes(tab.value) ? handleReject : undefined}
                      onDeliver={["accepted", "delivering"].includes(tab.value) ? handleDeliver : undefined}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
