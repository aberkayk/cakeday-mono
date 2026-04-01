"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Store, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { adminApi } from "@/lib/api";
import { formatDate, BAKERY_STATUS_LABELS } from "@/lib/utils";
import type { Bakery } from "@cakeday/shared";

const STATUS_COLORS: Record<string, string> = {
  pending_setup: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  suspended: "bg-red-100 text-red-800",
};

export default function BakeryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [bakery, setBakery] = useState<Bakery | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminApi.bakery(id).then((res) => setBakery(res.data)).finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!bakery) return <p className="text-muted-foreground">Pastane bulunamadı.</p>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/bakeries"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{bakery.name}</h1>
            <Badge className={`text-xs ${STATUS_COLORS[bakery.status] ?? ""}`}>
              {BAKERY_STATUS_LABELS[bakery.status] ?? bakery.status}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">/{bakery.slug} · Kayıt: {formatDate(bakery.created_at)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Store className="h-5 w-5 text-muted-foreground" />
              Pastane Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {bakery.description && (
              <>
                <p className="text-muted-foreground">{bakery.description}</p>
                <Separator />
              </>
            )}
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>{bakery.address}</span>
            </div>
            {bakery.iban && (
              <>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IBAN</span>
                  <span className="font-mono text-xs">{bakery.iban}</span>
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
            <p className="font-medium">{bakery.contact_name}</p>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3.5 w-3.5" /><span>{bakery.contact_email}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5" /><span>{bakery.contact_phone}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {bakery.admin_note && (
        <Card className="border border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <p className="text-sm font-medium text-orange-800 mb-1">Admin Notu</p>
            <p className="text-sm text-orange-700">{bakery.admin_note}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
