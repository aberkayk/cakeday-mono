"use client";

import { ShoppingBag } from "lucide-react";
import { OrderCard } from "./order-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Order } from "@cakeday/shared";

interface OrderListProps {
  orders: Order[];
  isLoading?: boolean;
  onCancel?: (order: Order) => void;
  emptyMessage?: string;
}

export function OrderList({ orders, isLoading = false, onCancel, emptyMessage }: OrderListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-2xl bg-surface-container-low flex items-center justify-center mb-4">
          <ShoppingBag className="h-8 w-8 text-on-surface-variant/40" />
        </div>
        <p className="text-sm font-semibold text-on-surface-variant mb-1">Sipariş bulunamadı</p>
        <p className="text-xs text-on-surface-variant/70">
          {emptyMessage ?? "Bu kategoride sipariş yok."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} onCancel={onCancel} />
      ))}
    </div>
  );
}
