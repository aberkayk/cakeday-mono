"use client";

import { Users, ShoppingBag, Cake, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardsProps {
  totalEmployees: number;
  upcomingBirthdays: number;
  activeOrders: number;
  ordersThisMonth: number;
  isLoading?: boolean;
}

export function StatsCards({
  totalEmployees,
  upcomingBirthdays,
  activeOrders,
  ordersThisMonth,
  isLoading = false,
}: StatsCardsProps) {
  const cards = [
    {
      title: "Toplam Çalışan",
      value: totalEmployees,
      icon: Users,
      description: "Aktif çalışan sayısı",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Yaklaşan Doğum Günleri",
      value: upcomingBirthdays,
      icon: Cake,
      description: "Sonraki 30 günde",
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
    {
      title: "Aktif Siparişler",
      value: activeOrders,
      icon: ShoppingBag,
      description: "Devam eden siparişler",
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Bu Ay Siparişler",
      value: ordersThisMonth,
      icon: TrendingUp,
      description: "Bu ayki toplam sipariş",
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{card.value.toLocaleString("tr-TR")}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
