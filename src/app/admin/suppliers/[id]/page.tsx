"use client";

import Link from "next/link";
import { ArrowLeft, Store, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate, SUPPLIER_STATUS_LABELS } from "@/lib/utils";
import type { Supplier } from "@/lib/shared";

// TODO: wire to server actions

const STATUS_COLORS: Record<string, string> = {
  pending_setup: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  suspended: "bg-red-100 text-red-800",
};

// Placeholder until wired to server actions
const supplier: Supplier | null = null;

export default function SupplierDetailPage() {
  if (!supplier) return <p className="text-muted-foreground">Tedarikçi bulunamadı.</p>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/suppliers"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{supplier.name}</h1>
            <Badge className={`text-xs ${STATUS_COLORS[supplier.status] ?? ""}`}>
              {SUPPLIER_STATUS_LABELS[supplier.status] ?? supplier.status}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">/{supplier.slug} · Kayıt: {formatDate(supplier.created_at)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Store className="h-5 w-5 text-muted-foreground" />
              Tedarikçi Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {supplier.description && (
              <>
                <p className="text-muted-foreground">{supplier.description}</p>
                <Separator />
              </>
            )}
            {supplier.address_id && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span className="font-mono text-xs">{supplier.address_id}</span>
              </div>
            )}
            {supplier.iban && (
              <>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IBAN</span>
                  <span className="font-mono text-xs">{supplier.iban}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              İletişim
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">İletişim bilgileri henüz eklenmedi.</p>
          </CardContent>
        </Card>
      </div>

      {supplier.admin_note && (
        <Card className="border border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <p className="text-sm font-medium text-orange-800 mb-1">Admin Notu</p>
            <p className="text-sm text-orange-700">{supplier.admin_note}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
