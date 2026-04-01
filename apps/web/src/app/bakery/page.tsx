"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, CheckCircle, Clock, Truck, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBakeryOrders } from "@/hooks/use-orders";
import { formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, formatCurrency } from "@/lib/utils";
import type { Order } from "@cakeday/shared";

export default function BakeryDashboardPage() {
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
    { label: "Yeni Siparişler", value: newOrders.length, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Hazırlanan", value: acceptedOrders.length, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Bugün Teslimat", value: todayDeliveries.length, icon: Truck, color: "text-green-600", bg: "bg-green-50" },
    { label: "Toplam Sipariş", value: orders.length, icon: CheckCircle, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pastane Paneli</h1>
        <p className="text-muted-foreground text-sm mt-1">Bugünün siparişleri ve özet bilgiler.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">{stat.label}</CardTitle>
                <div className={`rounded-lg p-2 ${stat.bg}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-12" /> : (
                  <p className="text-3xl font-bold">{stat.value}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Today's deliveries */}
      <Card className="border border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base font-semibold">Bugünün Teslimatları</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/bakery/orders">
              Tümü <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
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
            <p className="text-center text-sm text-muted-foreground py-8">
              Bugün teslimat yok.
            </p>
          ) : (
            <div className="space-y-1">
              {todayDeliveries.map((order: Order) => (
                <div key={order.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{order.recipient_name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-xs">{order.delivery_address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{formatCurrency(order.base_price_try)}</p>
                    <Badge className={`text-xs ${ORDER_STATUS_COLORS[order.status] ?? ""}`}>
                      {ORDER_STATUS_LABELS[order.status] ?? order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
