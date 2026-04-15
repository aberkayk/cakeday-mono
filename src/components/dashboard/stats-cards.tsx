"use client";

import { Users, ShoppingBag, Cake, TrendingUp } from "lucide-react";
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
      description: "Kayıtlı çalışan",
      iconBg: "bg-background-secondary",
      iconColor: "text-muted",
      valueBg: "bg-background-secondary",
    },
    {
      title: "Yaklaşan Doğum Günleri",
      value: upcomingBirthdays,
      icon: Cake,
      description: "Sonraki 30 günde",
      iconBg: "bg-secondary-container/30",
      iconColor: "text-secondary",
      valueBg: "bg-secondary-container/20",
    },
    {
      title: "Aktif Siparişler",
      value: activeOrders,
      icon: ShoppingBag,
      description: "Devam eden",
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
      valueBg: "bg-primary/60",
    },
    {
      title: "Bu Ay Siparişler",
      value: ordersThisMonth,
      icon: TrendingUp,
      description: "Toplam sipariş",
      iconBg: "bg-tertiary-container/30",
      iconColor: "text-tertiary",
      valueBg: "bg-tertiary-container/20",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-background rounded-2xl p-6 shadow-sm border border-border-soft">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
            <Skeleton className="h-9 w-16 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title} className="bg-background rounded-2xl p-6 shadow-sm border border-border-soft hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted">{card.title}</p>
              <div className={`h-10 w-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
            <p className="text-3xl font-bold font-headline text-foreground mb-1">
              {card.value.toLocaleString("tr-TR")}
            </p>
            <p className="text-xs text-muted">{card.description}</p>
          </div>
        );
      })}
    </div>
  );
}
