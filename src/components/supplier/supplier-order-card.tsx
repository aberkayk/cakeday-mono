"use client";

import { useState } from "react";
import { Calendar, MapPin, Cake, CheckCircle, XCircle, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatDate, formatCurrency, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PRODUCT_SIZE_LABELS, DISTRICT_LABELS } from "@/lib/utils";
import type { Order } from "@/lib/shared";

interface SupplierOrderCardProps {
  order: Order;
  onAccept?: (id: string) => Promise<void>;
  onReject?: (id: string, reason: string) => Promise<void>;
  onDeliver?: (id: string) => Promise<void>;
}

export function SupplierOrderCard({ order, onAccept, onReject, onDeliver }: SupplierOrderCardProps) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canAccept = order.status === "assigned";
  const canReject = ["assigned", "accepted"].includes(order.status);
  const canDeliver = ["accepted", "preparing", "out_for_delivery"].includes(order.status);

  const handleAccept = async () => {
    if (!onAccept) return;
    setIsSubmitting(true);
    try { await onAccept(order.id); } finally { setIsSubmitting(false); }
  };

  const handleRejectConfirm = async () => {
    if (!onReject) return;
    setIsSubmitting(true);
    try {
      await onReject(order.id, rejectReason);
      setRejectOpen(false);
    } finally { setIsSubmitting(false); }
  };

  const handleDeliver = async () => {
    if (!onDeliver) return;
    setIsSubmitting(true);
    try { await onDeliver(order.id); } finally { setIsSubmitting(false); }
  };

  return (
    <>
      <div className="bg-background rounded-2xl border border-border-soft shadow-sm hover:shadow-md transition-shadow p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="font-semibold text-sm text-foreground">{order.recipient_name}</p>
            <p className="text-xs text-muted font-mono">#{order.id.slice(0, 8)}</p>
          </div>
          <Badge className={`text-xs shrink-0 ${ORDER_STATUS_COLORS[order.status] ?? "bg-background-secondary text-muted"}`}>
            {ORDER_STATUS_LABELS[order.status] ?? order.status}
          </Badge>
        </div>

        <div className="space-y-1.5 text-xs text-muted mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{formatDate(order.delivery_date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{order.delivery_address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Cake className="h-3.5 w-3.5 shrink-0" />
            <span>{PRODUCT_SIZE_LABELS[order.product_size] ?? order.product_size} · {DISTRICT_LABELS[order.delivery_district] ?? order.delivery_district}</span>
          </div>
        </div>

        {order.custom_text && (
          <p className="mb-3 text-xs italic text-muted border-l-2 border-primary/30 pl-2">
            "{order.custom_text}"
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border-soft/30">
          <p className="font-semibold text-sm text-foreground">{formatCurrency(order.base_price_try)}</p>
        </div>

        {(canAccept || canReject || canDeliver) && (
          <div className="flex gap-2 mt-3">
            {canAccept && onAccept && (
              <Button
                size="sm"
                className="flex-1 h-8 text-xs rounded-xl gradient-primary text-white shadow-primary"
                onClick={handleAccept}
                disabled={isSubmitting}
              >
                <CheckCircle className="mr-1 h-3.5 w-3.5" />
                Kabul Et
              </Button>
            )}
            {canDeliver && onDeliver && (
              <Button
                size="sm"
                variant="tonal"
                className="flex-1 h-8 text-xs rounded-xl"
                onClick={handleDeliver}
                disabled={isSubmitting}
              >
                <Truck className="mr-1 h-3.5 w-3.5" />
                Teslim Edildi
              </Button>
            )}
            {canReject && onReject && (
              <Button
                size="sm"
                variant="ghost"
                className="flex-1 h-8 text-xs rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50/50"
                onClick={() => setRejectOpen(true)}
                disabled={isSubmitting}
              >
                <XCircle className="mr-1 h-3.5 w-3.5" />
                Reddet
              </Button>
            )}
          </div>
        )}
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-sm rounded-2xl border-0 shadow-ambient">
          <DialogHeader>
            <DialogTitle className="font-headline text-foreground">Siparişi Reddet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted">
              <strong className="text-foreground">{order.recipient_name}</strong> siparişini reddetmek üzeresiniz.
            </p>
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-foreground text-sm font-medium">Red Nedeni</Label>
              <Textarea
                id="reason"
                placeholder="Neden reddediyorsunuz?"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="rounded-xl border-border-soft bg-background-secondary focus:bg-background focus:ring-primary/20 resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setRejectOpen(false)} className="flex-1 rounded-xl">İptal</Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={isSubmitting || !rejectReason.trim()}
              className="flex-1 rounded-xl"
            >
              Reddet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
