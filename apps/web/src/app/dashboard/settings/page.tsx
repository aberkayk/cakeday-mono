"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Building2, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { companyApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { SECTOR_OPTIONS, COMPANY_SIZE_LABELS, DISTRICT_LABELS } from "@/lib/utils";
import type { Company } from "@cakeday/shared";

const schema = z.object({
  name: z.string().min(1, "Şirket adı gerekli."),
  primary_contact_name: z.string().min(1, "Ad Soyad gerekli."),
  primary_contact_phone: z.string().min(1, "Telefon gerekli."),
  billing_address: z.string().min(5, "Adres gerekli."),
  sector: z.string().optional(),
  company_size_range: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function SettingsPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifWA, setNotifWA] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    companyApi
      .get()
      .then((res) => {
        setCompany(res.data);
        reset({
          name: res.data.name,
          primary_contact_name: res.data.primary_contact_name,
          primary_contact_phone: res.data.primary_contact_phone,
          billing_address: res.data.billing_address,
          sector: res.data.sector ?? "",
          company_size_range: res.data.company_size_range ?? "",
        });
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [reset]);

  const onSubmit = async (data: FormData) => {
    try {
      await companyApi.update(data);
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
      <div>
        <h1 className="text-2xl font-bold">Ayarlar</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Şirket profili ve bildirim tercihlerinizi yönetin.
        </p>
      </div>

      {/* Company profile */}
      <Card className="border border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            Şirket Profili
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Şirket Adı</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sektör</Label>
                <Select
                  defaultValue={company?.sector ?? ""}
                  onValueChange={(v) => setValue("sector", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTOR_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Çalışan Sayısı</Label>
                <Select
                  defaultValue={company?.company_size_range ?? ""}
                  onValueChange={(v) => setValue("company_size_range", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(COMPANY_SIZE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="primary_contact_name">Yetkili Ad Soyad</Label>
              <Input id="primary_contact_name" {...register("primary_contact_name")} />
              {errors.primary_contact_name && <p className="text-xs text-destructive">{errors.primary_contact_name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary_contact_phone">Yetkili Telefon</Label>
              <Input id="primary_contact_phone" type="tel" {...register("primary_contact_phone")} />
              {errors.primary_contact_phone && <p className="text-xs text-destructive">{errors.primary_contact_phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_address">Fatura Adresi</Label>
              <Input id="billing_address" {...register("billing_address")} />
              {errors.billing_address && <p className="text-xs text-destructive">{errors.billing_address.message}</p>}
            </div>

            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kaydet
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            Bildirim Tercihleri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">E-posta Bildirimleri</p>
              <p className="text-xs text-muted-foreground">Sipariş durumu ve doğum günü hatırlatıcıları</p>
            </div>
            <Switch checked={notifEmail} onCheckedChange={setNotifEmail} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">WhatsApp Bildirimleri</p>
              <p className="text-xs text-muted-foreground">Sipariş güncellemeleri için anlık mesajlar</p>
            </div>
            <Switch checked={notifWA} onCheckedChange={setNotifWA} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Doğum Günü Hatırlatıcısı</p>
              <p className="text-xs text-muted-foreground">Doğum günü 3 gün önce e-posta bildirimi</p>
            </div>
            <Switch defaultChecked />
          </div>

          <Button variant="outline" size="sm">
            Bildirimleri Kaydet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
