"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, CheckCircle, Clock, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBakeryOrders } from "@/hooks/use-orders";
import { formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, formatCurrency } from "@/lib/utils";
import type { Order } from "@/lib/shared";

export function BakeryDashboardView() {
  const { orders, isLoading, fetchOrders } = useBakeryOrders();

  useEffect(() => {
    fetchOrders({ pageSize: 20 });
  }, []);

  const newOrders = orders.filter((o) => o.status === "assigned");
  const acceptedOrders = orders.filter((o) => ["accepted", "preparing"].includes(o.status));
  const todayDeliveries = orders.filter((o) => {
    const today = new Date().toISOString().slice(0, 10);
    return o.delivery_date === today && o.status !== "cancelled" && o.status !== "rejected";
  });

  const stats = [
    { label: "Yeni Siparişler", value: newOrders.length, icon: ShoppingBag, color: "text-muted", bg: "bg-background-secondary" },
    { label: "Hazırlanan", value: acceptedOrders.length, icon: Clock, color: "text-accent-foreground", bg: "bg-accent/20" },
    { label: "Bugün Teslimat", value: todayDeliveries.length, icon: Truck, color: "text-primary", bg: "bg-primary/20" },
    { label: "Toplam Sipariş", value: orders.length, icon: CheckCircle, color: "text-foreground", bg: "bg-background-secondary" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline text-foreground">Pastane Paneli</h1>
        <p className="text-muted text-sm mt-1">Bugünün siparişleri ve özet bilgiler.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-background rounded-2xl p-5 shadow-sm border border-border-soft">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted">{stat.label}</p>
                <div className={`rounded-lg p-2 ${stat.bg}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              {isLoading ? <Skeleton className="h-8 w-12" /> : (
                <p className="text-3xl font-bold font-headline text-foreground">{stat.value}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Today's deliveries */}
      <div className="bg-background rounded-2xl shadow-sm border border-border-soft">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-soft/50">
          <h2 className="text-base font-semibold font-headline text-foreground">Bugünün Teslimatları</h2>
          <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary hover:bg-primary/50">
            <Link href="/bakery/orders">
              Tümü <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="px-6 py-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          ) : todayDeliveries.length === 0 ? (
            <p className="text-center text-sm text-muted py-8">
              Bugün teslimat yok.
            </p>
          ) : (
            <div className="space-y-1">
              {todayDeliveries.map((order: Order) => (
                <div key={order.id} className="flex items-center justify-between py-2.5 border-b border-border-soft/30 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{order.recipient_name}</p>
                    <p className="text-xs text-muted truncate max-w-xs">{order.delivery_address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(order.base_price_try)}</p>
                    <Badge className={`text-xs ${ORDER_STATUS_COLORS[order.status] ?? ""}`}>
                      {ORDER_STATUS_LABELS[order.status] ?? order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
