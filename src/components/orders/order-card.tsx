"use client";

import { Calendar, MapPin, Cake, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, CAKE_SIZE_LABELS, DISTRICT_LABELS } from "@/lib/utils";
import type { Order } from "@cakeday/shared";

interface OrderCardProps {
  order: Order;
  onCancel?: (order: Order) => void;
}

export function OrderCard({ order, onCancel }: OrderCardProps) {
  const canCancel = ["draft", "pending_approval", "confirmed"].includes(order.status);

  return (
    <div className="bg-background rounded-2xl border border-border-soft shadow-sm hover:shadow-ambient transition-all p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg shrink-0">
            🎂
          </div>
          <div>
            <p className="text-sm font-bold text-foreground font-headline truncate max-w-[120px]">{order.recipient_name}</p>
            <p className="text-[10px] text-muted font-medium uppercase tracking-wider">
              {order.order_type === "automatic" ? "Otomatik" : "Manuel"}
            </p>
          </div>
        </div>
        <Badge
          className={`text-[11px] font-semibold shrink-0 border-0 ${ORDER_STATUS_COLORS[order.status] ?? "bg-background-secondary text-muted"}`}
        >
          {ORDER_STATUS_LABELS[order.status] ?? order.status}
        </Badge>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2.5 text-xs text-muted">
          <div className="h-6 w-6 rounded-lg bg-background-secondary flex items-center justify-center shrink-0">
            <Calendar className="h-3.5 w-3.5 text-muted" />
          </div>
          <span className="font-medium">{formatDate(order.delivery_date)}</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-muted">
          <div className="h-6 w-6 rounded-lg bg-background-secondary flex items-center justify-center shrink-0">
            <MapPin className="h-3.5 w-3.5 text-muted" />
          </div>
          <span className="font-medium">{DISTRICT_LABELS[order.delivery_district] ?? order.delivery_district}</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-muted">
          <div className="h-6 w-6 rounded-lg bg-background-secondary flex items-center justify-center shrink-0">
            <Cake className="h-3.5 w-3.5 text-muted" />
          </div>
          <span className="font-medium">{CAKE_SIZE_LABELS[order.cake_size] ?? order.cake_size}</span>
        </div>
      </div>

      {order.custom_text && (
        <div className="mb-4 bg-accent/20 rounded-xl px-3 py-2 border-l-2 border-accent/30">
          <p className="text-xs italic text-muted-foreground line-clamp-1">"{order.custom_text}"</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border-soft/20">
        <p className="text-sm font-bold text-foreground font-headline">{formatCurrency(order.order_total_try)}</p>
        {canCancel && onCancel && (
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50/50 h-8 text-xs rounded-xl"
            onClick={() => onCancel(order)}
          >
            <XCircle className="mr-1.5 h-3.5 w-3.5" />
            İptal Et
          </Button>
        )}
      </div>
    </div>
  );
}
