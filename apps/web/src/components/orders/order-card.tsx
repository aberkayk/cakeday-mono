"use client";

import { Calendar, MapPin, Cake, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="border border-border hover:shadow-sm transition-shadow">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="font-semibold text-sm">{order.recipient_name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {order.order_type === "automatic" ? "Otomatik" : "Manuel"}
            </p>
          </div>
          <Badge
            className={`text-xs shrink-0 ${ORDER_STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700"}`}
          >
            {ORDER_STATUS_LABELS[order.status] ?? order.status}
          </Badge>
        </div>

        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{formatDate(order.delivery_date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>{DISTRICT_LABELS[order.delivery_district] ?? order.delivery_district}</span>
          </div>
          <div className="flex items-center gap-2">
            <Cake className="h-3.5 w-3.5 shrink-0" />
            <span>{CAKE_SIZE_LABELS[order.cake_size] ?? order.cake_size}</span>
          </div>
        </div>

        {order.custom_text && (
          <p className="mt-2 text-xs italic text-muted-foreground border-l-2 border-primary/30 pl-2">
            "{order.custom_text}"
          </p>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <p className="font-semibold text-sm">{formatCurrency(order.order_total_try)}</p>
          {canCancel && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive h-7 text-xs"
              onClick={() => onCancel(order)}
            >
              <XCircle className="mr-1 h-3.5 w-3.5" />
              İptal Et
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
