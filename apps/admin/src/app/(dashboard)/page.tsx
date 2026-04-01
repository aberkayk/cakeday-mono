"use client";

import { useEffect, useState } from "react";
import { Building2, Store, ShoppingBag, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

interface Stats {
  totalCompanies: number;
  totalBakeries: number;
  totalOrders: number;
  totalRevenueTry: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminApi
      .stats()
      .then((res) => setStats(res.data))
      .catch(() => setStats({ totalCompanies: 0, totalBakeries: 0, totalOrders: 0, totalRevenueTry: 0 }))
      .finally(() => setIsLoading(false));
  }, []);

  const cards = [
    { label: "Toplam Şirket", value: stats?.totalCompanies ?? 0, icon: Building2, color: "text-blue-600", bg: "bg-blue-50", format: "number" },
    { label: "Toplam Pastane", value: stats?.totalBakeries ?? 0, icon: Store, color: "text-orange-600", bg: "bg-orange-50", format: "number" },
    { label: "Toplam Sipariş", value: stats?.totalOrders ?? 0, icon: ShoppingBag, color: "text-purple-600", bg: "bg-purple-50", format: "number" },
    { label: "Toplam Ciro", value: stats?.totalRevenueTry ?? 0, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50", format: "currency" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Genel Bakış</h1>
        <p className="text-muted-foreground text-sm mt-1">CakeDay platformunun genel durumu.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="border border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                <div className={`rounded-lg p-2 ${card.bg}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="text-3xl font-bold">
                    {card.format === "currency"
                      ? formatCurrency(card.value)
                      : card.value.toLocaleString("tr-TR")}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
