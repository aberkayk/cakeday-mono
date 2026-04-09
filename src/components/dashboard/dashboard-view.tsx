"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Plus, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { UpcomingBirthdays } from "@/components/dashboard/upcoming-birthdays";
import { useEmployees } from "@/hooks/use-employees";
import { useOrders } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, formatCurrency } from "@/lib/utils";
import type { Order } from "@/lib/shared";

export function DashboardView() {
  const { employees, totalCount: totalEmployees, fetchEmployees, isLoading: empLoading } = useEmployees({ pageSize: 100 });
  const { orders, fetchOrders, isLoading: ordersLoading } = useOrders();
  const { user } = useAuth();

  const displayName = user?.user_metadata?.full_name ?? user?.email ?? "Kullanıcı";
  const firstName = displayName.split(" ")[0];

  useEffect(() => {
    fetchEmployees();
    fetchOrders({ pageSize: 5, sort: "created_at:desc" });
  }, []);

  const activeOrders = orders.filter((o) =>
    ["confirmed", "assigned", "accepted", "preparing", "out_for_delivery"].includes(o.status)
  ).length;

  const upcomingCount = employees.filter((e) => {
    if (!e.date_of_birth) return false;
    const today = new Date();
    const dob = new Date(e.date_of_birth);
    let next = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
    if (next <= today) next = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate());
    const diff = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff <= 30;
  }).length;

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl gradient-primary p-7 text-white shadow-primary">
        <div className="relative z-10">
          <p className="text-white/80 text-sm font-medium mb-1">Hoş geldiniz 👋</p>
          <h1 className="text-2xl font-bold mb-1 font-headline">Merhaba, {firstName}!</h1>
          <p className="text-white/80 text-sm">
            İşte güncel durum özetiniz. Bugün {upcomingCount > 0 ? `${upcomingCount} yaklaşan doğum günü var.` : "yaklaşan doğum günü yok."}
          </p>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-7xl opacity-20 select-none">🎂</div>
        <Button
          asChild
          className="mt-5 bg-white text-primary hover:bg-white/90 font-semibold shadow-sm"
          size="sm"
        >
          <Link href="/dashboard/orders/new">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Sipariş Oluştur
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <StatsCards
        totalEmployees={totalEmployees}
        upcomingBirthdays={upcomingCount}
        activeOrders={activeOrders}
        ordersThisMonth={orders.length}
        isLoading={empLoading}
      />

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Birthdays — left 2/3 */}
        <div className="lg:col-span-2">
          <UpcomingBirthdays employees={employees} isLoading={empLoading} />
        </div>

        {/* Quick Actions — right 1/3 */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider px-1">Hızlı İşlemler</h2>
          {[
            { href: "/dashboard/orders/new", label: "Manuel Sipariş Ver", desc: "Çalışan için pasta sipariş et", emoji: "🎂" },
            { href: "/dashboard/employees", label: "Çalışan Ekle", desc: "Yeni çalışan kaydı oluştur", emoji: "👤" },
            { href: "/dashboard/ordering-rules", label: "Kural Tanımla", desc: "Otomatik sipariş kuralı ekle", emoji: "⚙️" },
            { href: "/dashboard/employees/import", label: "Toplu Yükleme", desc: "CSV ile çalışan aktar", emoji: "📋" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 bg-background rounded-xl p-4 shadow-sm border border-border-soft/30 hover:shadow-md hover:border-primary transition-all group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-xl shrink-0">
                {item.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {item.label}
                </p>
                <p className="text-xs text-muted">{item.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-border group-hover:text-primary transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-background rounded-2xl shadow-sm border border-border-soft/30">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-soft/20">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Son Siparişler</h2>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary hover:bg-primary/20">
            <Link href="/dashboard/orders">
              Tümünü Gör
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="px-6 py-2">
          {ordersLoading ? (
            <div className="space-y-3 py-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2.5">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-4xl mb-3">🛒</div>
              <p className="text-sm font-medium text-foreground mb-1">Henüz sipariş yok</p>
              <p className="text-xs text-muted mb-4">İlk siparişinizi vermek için aşağıdaki butona tıklayın.</p>
              <Button asChild size="sm" className="gradient-primary text-white shadow-primary">
                <Link href="/dashboard/orders/new">İlk Siparişi Ver</Link>
              </Button>
            </div>
          ) : (
            <div>
              {orders.slice(0, 6).map((order: Order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-3.5 border-b border-border-soft/20 last:border-0 hover:bg-background-secondary/50 -mx-6 px-6 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-base shrink-0">
                      🎂
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{order.recipient_name}</p>
                      <p className="text-xs text-muted">
                        {formatDate(order.delivery_date)} · {formatCurrency(order.order_total_try)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={`text-xs font-medium border-0 ${ORDER_STATUS_COLORS[order.status] ?? "bg-background-secondary text-foreground"}`}
                  >
                    {ORDER_STATUS_LABELS[order.status] ?? order.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
