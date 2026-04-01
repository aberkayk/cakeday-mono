"use client";

import { useEffect, useState } from "react";
import { CreditCard, Download, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  pending: "bg-yellow-100 text-yellow-800",
  succeeded: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-blue-100 text-blue-800",
  void: "bg-gray-100 text-gray-800",
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Faturalama</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ödeme yöntemleri ve fatura geçmişinizi yönetin.
        </p>
      </div>

      {/* Payment method card */}
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            Ödeme Yöntemi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-md flex items-center justify-center">
                <span className="text-white text-xs font-bold">VISA</span>
              </div>
              <div>
                <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                <p className="text-xs text-muted-foreground">Son kullanma: 12/27</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Kartı Güncelle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoice history */}
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            Fatura Geçmişi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Fatura No</TableHead>
                <TableHead>Dönem</TableHead>
                <TableHead>Tutar</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Son Ödeme</TableHead>
                <TableHead className="text-right">İndir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(6)].map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground text-sm">
                    Henüz fatura yok.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-sm">{invoice.invoice_number}</TableCell>
                    <TableCell className="text-sm">
                      {formatDate(invoice.period_start)} — {formatDate(invoice.period_end)}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {formatCurrency(invoice.total_try)}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${PAYMENT_STATUS_COLORS[invoice.status] ?? ""}`}>
                        {PAYMENT_STATUS_LABELS[invoice.status] ?? invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {invoice.due_date ? formatDate(invoice.due_date) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {invoice.pdf_url ? (
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
