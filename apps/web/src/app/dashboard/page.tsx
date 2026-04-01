"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { UpcomingBirthdays } from "@/components/dashboard/upcoming-birthdays";
import { useEmployees } from "@/hooks/use-employees";
import { useOrders } from "@/hooks/use-orders";
import { formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, formatCurrency } from "@/lib/utils";
import type { Order } from "@cakeday/shared";

export default function DashboardPage() {
  const { employees, totalCount: totalEmployees, fetchEmployees, isLoading: empLoading } = useEmployees({ pageSize: 100 });
  const { orders, fetchOrders, isLoading: ordersLoading } = useOrders();

  useEffect(() => {
    fetchEmployees();
    fetchOrders({ pageSize: 5, sort: "created_at:desc" });
  }, []);

  const activeOrders = orders.filter((o) =>
    ["confirmed", "assigned", "accepted", "preparing", "out_for_delivery"].includes(o.status)
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Genel Bakış</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Hoş geldiniz! İşte güncel durum özetiniz.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/orders/new">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Sipariş
          </Link>
        </Button>
      </div>

      <StatsCards
        totalEmployees={totalEmployees}
        upcomingBirthdays={employees.filter(() => true).length}
        activeOrders={activeOrders}
        ordersThisMonth={orders.length}
        isLoading={empLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <UpcomingBirthdays employees={employees} isLoading={empLoading} />
        </div>

        <div className="lg:col-span-2">
          <Card className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base font-semibold">Son Siparişler</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/orders">
                  Tümü
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-5 w-20" />
                    </div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">Henüz sipariş yok.</p>
                  <Button asChild className="mt-3" size="sm">
                    <Link href="/dashboard/orders/new">İlk Siparişi Ver</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {orders.slice(0, 6).map((order: Order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">{order.recipient_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.delivery_date)} · {formatCurrency(order.order_total_try)}
                        </p>
                      </div>
                      <Badge
                        className={`text-xs ${ORDER_STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-800"}`}
                      >
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
