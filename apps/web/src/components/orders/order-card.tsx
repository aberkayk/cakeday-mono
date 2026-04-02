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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-coral-50 flex items-center justify-center text-lg shrink-0">
            🎂
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{order.recipient_name}</p>
            <p className="text-xs text-gray-400 capitalize">
              {order.order_type === "automatic" ? "Otomatik sipariş" : "Manuel sipariş"}
            </p>
          </div>
        </div>
        <Badge
          className={`text-xs font-semibold shrink-0 border-0 ${ORDER_STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700"}`}
        >
          {ORDER_STATUS_LABELS[order.status] ?? order.status}
        </Badge>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2.5 text-xs text-gray-500">
          <div className="h-6 w-6 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
          </div>
          <span>{formatDate(order.delivery_date)}</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-gray-500">
          <div className="h-6 w-6 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
            <MapPin className="h-3.5 w-3.5 text-gray-400" />
          </div>
          <span>{DISTRICT_LABELS[order.delivery_district] ?? order.delivery_district}</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-gray-500">
          <div className="h-6 w-6 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
            <Cake className="h-3.5 w-3.5 text-gray-400" />
          </div>
          <span>{CAKE_SIZE_LABELS[order.cake_size] ?? order.cake_size}</span>
        </div>
      </div>

      {order.custom_text && (
        <div className="mb-4 bg-coral-50/60 rounded-xl px-3 py-2 border-l-2 border-coral-200">
          <p className="text-xs italic text-gray-600">"{order.custom_text}"</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <p className="text-base font-bold text-gray-900">{formatCurrency(order.order_total_try)}</p>
        {canCancel && onCancel && (
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 text-xs rounded-xl"
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
