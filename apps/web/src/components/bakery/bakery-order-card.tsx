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
import { formatDate, formatCurrency, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, CAKE_SIZE_LABELS, DISTRICT_LABELS } from "@/lib/utils";
import type { Order } from "@cakeday/shared";

interface BakeryOrderCardProps {
  order: Order;
  onAccept?: (id: string) => Promise<void>;
  onReject?: (id: string, reason: string) => Promise<void>;
  onDeliver?: (id: string) => Promise<void>;
}

export function BakeryOrderCard({ order, onAccept, onReject, onDeliver }: BakeryOrderCardProps) {
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
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="font-semibold text-sm text-on-surface">{order.recipient_name}</p>
            <p className="text-xs text-on-surface-variant font-mono">#{order.id.slice(0, 8)}</p>
          </div>
          <Badge className={`text-xs shrink-0 ${ORDER_STATUS_COLORS[order.status] ?? "bg-surface-container text-on-surface-variant"}`}>
            {ORDER_STATUS_LABELS[order.status] ?? order.status}
          </Badge>
        </div>

        <div className="space-y-1.5 text-xs text-on-surface-variant mb-3">
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
            <span>{CAKE_SIZE_LABELS[order.cake_size] ?? order.cake_size} · {DISTRICT_LABELS[order.delivery_district] ?? order.delivery_district}</span>
          </div>
        </div>

        {order.custom_text && (
          <p className="mb-3 text-xs italic text-on-surface-variant border-l-2 border-primary/30 pl-2">
            "{order.custom_text}"
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30">
          <p className="font-semibold text-sm text-on-surface">{formatCurrency(order.base_price_try)}</p>
        </div>

        {(canAccept || canReject || canDeliver) && (
          <div className="flex gap-2 mt-3">
            {canAccept && onAccept && (
              <Button
                size="sm"
                className="flex-1 h-8 text-xs rounded-xl gradient-primary text-white shadow-[0_10px_20px_-5px_rgba(157,67,0,0.3)]"
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
                className="flex-1 h-8 text-xs rounded-xl bg-tertiary-container/40 text-tertiary hover:bg-tertiary-container/60 border-0"
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
                variant="outline"
                className="flex-1 h-8 text-xs rounded-xl text-red-500 border-red-200 hover:bg-red-50"
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
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-on-surface">Siparişi Reddet</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-on-surface-variant">
              <strong className="text-on-surface">{order.recipient_name}</strong> siparişini reddetmek üzeresiniz.
            </p>
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-on-surface">Red Nedeni</Label>
              <Textarea
                id="reason"
                placeholder="Neden reddediyorsunuz?"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="rounded-xl border-outline-variant focus:border-primary resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)} className="rounded-xl border-outline-variant">İptal</Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={isSubmitting || !rejectReason.trim()}
              className="rounded-xl"
            >
              Reddet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
