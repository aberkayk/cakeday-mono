"use client";

import { useEffect, useState } from "react";
import { CreditCard, Download, FileText, Zap, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { billingApi } from "@/lib/api";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Invoice } from "@cakeday/shared";

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Bekliyor",
  succeeded: "Ödendi",
  failed: "Başarısız",
  refunded: "İade Edildi",
  void: "İptal",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  succeeded: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-700",
  refunded: "bg-blue-50 text-blue-700",
  void: "bg-background-secondary text-muted",
};

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    billingApi
      .invoices({ pageSize: 20 })
      .then((res) => setInvoices(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground font-headline">Faturalama</h1>
        <p className="text-sm text-muted mt-1">
          Ödeme yöntemleri ve fatura geçmişinizi yönetin.
        </p>
      </div>

      {/* Current Plan Card */}
      <div className="relative overflow-hidden rounded-2xl bg-foreground p-6 text-white shadow-sm">
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/90 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                Aktif Plan
              </span>
              <h2 className="text-xl font-bold mb-1 font-headline">Başlangıç Planı</h2>
              <p className="text-white/70 text-sm">Aylık 25 siparişe kadar</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">₺499</p>
              <p className="text-white/60 text-xs mt-0.5">/ ay</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              "25 aylık sipariş",
              "Otomatik siparişler",
              "E-posta bildirimleri",
              "CSV içe aktarma",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                <CheckCircle className="h-3 w-3 text-green-400" />
                <span className="text-xs text-white/90">{feat}</span>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-5 rounded-xl border-white/20 text-white bg-white/10 hover:bg-white/20 hover:text-white"
          >
            <Zap className="mr-2 h-3.5 w-3.5" />
            Pro&apos;ya Yükselt
          </Button>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-8xl opacity-5 select-none">💳</div>
      </div>

      {/* Payment Method */}
      <div className="bg-background rounded-2xl border border-border-soft/30 shadow-sm p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center">
            <CreditCard className="h-4 w-4 text-blue-500" />
          </div>
          <h2 className="text-base font-bold text-foreground">Ödeme Yöntemi</h2>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-20 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold tracking-wider">VISA</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">•••• •••• •••• 4242</p>
              <p className="text-xs text-muted">Son kullanma: 12/27</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-border-soft text-foreground hover:bg-background-secondary"
          >
            Kartı Güncelle
          </Button>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-background rounded-2xl border border-border-soft/30 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-border-soft/20">
          <div className="h-8 w-8 rounded-xl bg-background-secondary flex items-center justify-center">
            <FileText className="h-4 w-4 text-muted" />
          </div>
          <h2 className="text-base font-bold text-foreground">Fatura Geçmişi</h2>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-background-secondary/80 hover:bg-background-secondary/80">
              <TableHead className="text-xs font-semibold text-muted uppercase tracking-wider">Fatura No</TableHead>
              <TableHead className="text-xs font-semibold text-muted uppercase tracking-wider">Dönem</TableHead>
              <TableHead className="text-xs font-semibold text-muted uppercase tracking-wider">Tutar</TableHead>
              <TableHead className="text-xs font-semibold text-muted uppercase tracking-wider">Durum</TableHead>
              <TableHead className="text-xs font-semibold text-muted uppercase tracking-wider">Son Ödeme</TableHead>
              <TableHead className="text-right text-xs font-semibold text-muted uppercase tracking-wider">İndir</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {[...Array(6)].map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full max-w-[100px]" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="h-14 w-14 rounded-2xl bg-background-secondary flex items-center justify-center mb-3">
                      <FileText className="h-7 w-7 text-border" />
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">Henüz fatura yok</p>
                    <p className="text-xs text-muted">Ödeme geçmişiniz burada görünecek.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-background-secondary/60 border-border-soft/20">
                  <TableCell className="font-mono text-sm text-foreground">{invoice.invoice_number}</TableCell>
                  <TableCell className="text-sm text-muted">
                    {formatDate(invoice.period_start)} — {formatDate(invoice.period_end)}
                  </TableCell>
                  <TableCell className="text-sm font-bold text-foreground">
                    {formatCurrency(invoice.total_try)}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs font-semibold border-0 ${PAYMENT_STATUS_COLORS[invoice.status] ?? ""}`}>
                      {PAYMENT_STATUS_LABELS[invoice.status] ?? invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted">
                    {invoice.due_date ? formatDate(invoice.due_date) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {invoice.pdf_url ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl hover:bg-background-secondary text-muted hover:text-foreground"
                        asChild
                      >
                        <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
