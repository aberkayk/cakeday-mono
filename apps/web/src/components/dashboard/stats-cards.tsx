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
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      valueBg: "bg-blue-50/60",
    },
    {
      title: "Yaklaşan Doğum Günleri",
      value: upcomingBirthdays,
      icon: Cake,
      description: "Sonraki 30 günde",
      iconBg: "bg-pink-50",
      iconColor: "text-pink-500",
      valueBg: "bg-pink-50/60",
    },
    {
      title: "Aktif Siparişler",
      value: activeOrders,
      icon: ShoppingBag,
      description: "Devam eden",
      iconBg: "bg-coral-50",
      iconColor: "text-coral-500",
      valueBg: "bg-coral-50/60",
    },
    {
      title: "Bu Ay Siparişler",
      value: ordersThisMonth,
      icon: TrendingUp,
      description: "Toplam sipariş",
      iconBg: "bg-green-50",
      iconColor: "text-green-500",
      valueBg: "bg-green-50/60",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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
          <div key={card.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <div className={`h-10 w-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {card.value.toLocaleString("tr-TR")}
            </p>
            <p className="text-xs text-gray-400">{card.description}</p>
          </div>
        );
      })}
    </div>
  );
}
