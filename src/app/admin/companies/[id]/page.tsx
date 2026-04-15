"use client";

import Link from "next/link";
import { ArrowLeft, Building2, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate, COMPANY_STATUS_LABELS } from "@/lib/utils";
import type { Company, Contact, Address } from "@/lib/shared";

// TODO: wire to server actions

const STATUS_COLORS: Record<string, string> = {
  pending_verification: "bg-yellow-100 text-yellow-800",
  pending_approval: "bg-orange-100 text-orange-800",
  active: "bg-green-100 text-green-800",
  suspended: "bg-red-100 text-red-800",
  deactivated: "bg-gray-100 text-gray-800",
};

// Placeholder until wired to server actions
const company: Company | null = null;
const contacts: Contact[] = [];
const addresses: Address[] = [];

export default function CompanyDetailPage() {
  if (!company) return <p className="text-muted-foreground">Şirket bulunamadı.</p>;

  const primaryContact = contacts[0];
  const primaryAddress = addresses[0];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/companies"><ArrowLeft className="h-5 w-5" /></Link>
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
        {/* TODO: wire suspend action */}
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
              <span className="font-mono font-medium">{company.vkn ?? "—"}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sektör</span>
              <span>{company.sector ?? "—"}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">E-posta</span>
              <span>{company.email ?? "—"}</span>
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
            {primaryContact ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{primaryContact.name}</span>
                  {primaryContact.title && (
                    <span className="text-muted-foreground">· {primaryContact.title}</span>
                  )}
                </div>
                {primaryContact.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{primaryContact.email}</span>
                  </div>
                )}
                {primaryContact.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{primaryContact.phone}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">İletişim bilgisi yok.</p>
            )}
            {primaryAddress && (
              <>
                <Separator />
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>{primaryAddress.address}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
