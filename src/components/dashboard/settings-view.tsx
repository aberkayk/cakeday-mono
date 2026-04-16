"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Building2, Bell, Mail, MessageCircle, Clock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateCompanyProfile } from "@/actions/companies";
import { useToast } from "@/hooks/use-toast";
import { SECTOR_OPTIONS } from "@/lib/utils";
import type { Company, Contact, Address } from "@/lib/shared";

const schema = z.object({
  name: z.string().min(1, "Şirket adı gerekli."),
  email: z.string().email("Geçerli bir e-posta giriniz.").optional().or(z.literal("")),
  sector: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

function SectionCard({ icon: Icon, title, description, children }: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background rounded-2xl border border-border-soft shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-border-soft/50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold font-headline text-foreground">{title}</h2>
            {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
          </div>
        </div>
      </div>
      <div className="px-6 py-5">
        {children}
      </div>
    </div>
  );
}

interface SettingsViewProps {
  company: Company;
  contact?: Contact | null;
  address?: Address | null;
}

export function SettingsView({ company, contact = null, address = null }: SettingsViewProps) {
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifWA, setNotifWA] = useState(false);
  const [notifBirthday, setNotifBirthday] = useState(true);
  const { toast } = useToast();

  const primaryContact = contact;
  const primaryAddress = address;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: company.name,
      email: company.email ?? "",
      sector: company.sector ?? "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await updateCompanyProfile({
        name: data.name,
        email: data.email || undefined,
        sector: data.sector || undefined,
      });
      toast({ title: "Şirket bilgileri güncellendi." });
    } catch (err) {
      toast({
        title: "Hata",
        description: err instanceof Error ? err.message : "Güncelleme başarısız.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold font-headline text-foreground">Ayarlar</h1>
        <p className="text-sm text-muted mt-1">
          Şirket profili ve bildirim tercihlerinizi yönetin.
        </p>
      </div>

      {/* Company Profile */}
      <SectionCard
        icon={Building2}
        title="Şirket Profili"
        description="Temel şirket bilgilerini güncelleyin."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">Şirket Adı</Label>
            <Input
              id="name"
              {...register("name")}
              className="rounded-xl border-border-soft focus:border-primary"
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">E-posta</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className="rounded-xl border-border-soft focus:border-primary"
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">Sektör</Label>
            <Select
              defaultValue={company.sector ?? ""}
              onValueChange={(v) => setValue("sector", v)}
            >
              <SelectTrigger className="rounded-xl border-border-soft">
                <SelectValue placeholder="Seçin" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {SECTOR_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {primaryContact && (
            <>
              <Separator className="bg-border-soft/50" />
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Yetkili Bilgileri</p>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted">Ad:</span> {primaryContact.name}</p>
                {primaryContact.title && <p><span className="text-muted">Unvan:</span> {primaryContact.title}</p>}
                {primaryContact.phone && <p><span className="text-muted">Telefon:</span> {primaryContact.phone}</p>}
                {primaryContact.email && <p><span className="text-muted">E-posta:</span> {primaryContact.email}</p>}
              </div>
              {/* TODO: contacts CRUD */}
            </>
          )}

          {primaryAddress && (
            <>
              <Separator className="bg-border-soft/50" />
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Fatura Adresi</p>
              <p className="text-sm">{primaryAddress.address}</p>
              {/* TODO: addresses CRUD */}
            </>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            size="lg"
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Kaydet
              </>
            )}
          </Button>
        </form>
      </SectionCard>

      {/* Notifications */}
      <SectionCard
        icon={Bell}
        title="Bildirim Tercihleri"
        description="Hangi bildirimleri almak istediğinizi seçin."
      >
        <div className="space-y-1">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-background-secondary flex items-center justify-center shrink-0">
                <Mail className="h-4 w-4 text-muted" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">E-posta Bildirimleri</p>
                <p className="text-xs text-muted">Sipariş durumu ve hatırlatıcılar</p>
              </div>
            </div>
            <Switch checked={notifEmail} onCheckedChange={setNotifEmail} />
          </div>

          <Separator className="bg-border-soft/30" />

          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-background-secondary flex items-center justify-center shrink-0">
                <MessageCircle className="h-4 w-4 text-muted" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">WhatsApp Bildirimleri</p>
                <p className="text-xs text-muted">Sipariş güncellemeleri için anlık mesajlar</p>
              </div>
            </div>
            <Switch checked={notifWA} onCheckedChange={setNotifWA} />
          </div>

          <Separator className="bg-border-soft/30" />

          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Doğum Günü Hatırlatıcısı</p>
                <p className="text-xs text-muted">Doğum günü 3 gün önce bildirim</p>
              </div>
            </div>
            <Switch checked={notifBirthday} onCheckedChange={setNotifBirthday} />
          </div>

          <Separator className="bg-border-soft/30" />

          <div className="pt-3">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-border-soft text-foreground hover:bg-background-secondary"
            >
              <Save className="mr-2 h-3.5 w-3.5" />
              Bildirimleri Kaydet
            </Button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
