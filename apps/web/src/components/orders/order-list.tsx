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
          <Skeleton key={i} className="h-44 rounded-xl" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground text-sm">
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
