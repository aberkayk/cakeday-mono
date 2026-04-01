"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Mail, Phone, MapPin, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { adminApi } from "@/lib/api";
import { formatDate, COMPANY_STATUS_LABELS } from "@/lib/utils";
import type { Company } from "@cakeday/shared";

const STATUS_COLORS: Record<string, string> = {
  pending_verification: "bg-yellow-100 text-yellow-800",
  pending_approval: "bg-orange-100 text-orange-800",
  active: "bg-green-100 text-green-800",
  suspended: "bg-red-100 text-red-800",
  deactivated: "bg-gray-100 text-gray-800",
};

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminApi.company(id).then((res) => setCompany(res.data)).finally(() => setIsLoading(false));
  }, [id]);

  const handleSuspend = async () => {
    if (!company) return;
    if (!confirm("Bu şirketi askıya almak istediğinizden emin misiniz?")) return;
    try {
      const res = await adminApi.suspendCompany(id);
      setCompany(res.data);
    } catch (err) {
      alert("İşlem başarısız.");
    }
  };

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

  if (!company) return <p className="text-muted-foreground">Şirket bulunamadı.</p>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/companies"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <Badge className={`text-xs ${STATUS_COLORS[company.status] ?? ""}`}>
              {COMPANY_STATUS_LABELS[company.status] ?? company.status}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">Kayıt: {formatDate(company.created_at)}</p>
        </div>
        {company.status === "active" && (
          <Button variant="outline" className="text-destructive border-destructive/30" onClick={handleSuspend}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Askıya Al
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              Şirket Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">VKN</span>
              <span className="font-mono font-medium">{company.vkn}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sektör</span>
              <span>{company.sector ?? "—"}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Çalışan Sayısı</span>
              <span>{company.company_size_range ?? "—"}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Abonelik Planı</span>
              <span>{company.subscription_plan_id ?? "Yok"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              İletişim Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">{company.primary_contact_name}</span>
              {company.primary_contact_title && (
                <span className="text-muted-foreground">· {company.primary_contact_title}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <span>{company.primary_contact_email}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              <span>{company.primary_contact_phone}</span>
            </div>
            <Separator />
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>{company.billing_address}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {company.admin_note && (
        <Card className="border border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <p className="text-sm font-medium text-orange-800 mb-1">Admin Notu</p>
            <p className="text-sm text-orange-700">{company.admin_note}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
