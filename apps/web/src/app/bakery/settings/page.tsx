"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Store, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().min(1, "Pastane adı gerekli."),
  contact_name: z.string().min(1, "İletişim kişisi gerekli."),
  contact_email: z.string().email("Geçerli e-posta girin."),
  contact_phone: z.string().min(1, "Telefon gerekli."),
  address: z.string().min(5, "Adres gerekli."),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function BakerySettingsPage() {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      address: "",
      description: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 500));
    toast({ title: "Pastane bilgileri güncellendi." });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Ayarlar</h1>
        <p className="text-muted-foreground text-sm mt-1">Pastane profili ve bildirim tercihlerinizi yönetin.</p>
      </div>

      <Card className="border border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Store className="h-5 w-5 text-muted-foreground" />
            Pastane Profili
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Pastane Adı</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea id="description" placeholder="Pastane hakkında kısa bilgi..." rows={2} {...register("description")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adres</Label>
              <Input id="address" placeholder="Tam adres" {...register("address")} />
              {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="contact_name">İletişim Kişisi</Label>
              <Input id="contact_name" {...register("contact_name")} />
              {errors.contact_name && <p className="text-xs text-destructive">{errors.contact_name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_email">E-posta</Label>
                <Input id="contact_email" type="email" {...register("contact_email")} />
                {errors.contact_email && <p className="text-xs text-destructive">{errors.contact_email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Telefon</Label>
                <Input id="contact_phone" type="tel" {...register("contact_phone")} />
                {errors.contact_phone && <p className="text-xs text-destructive">{errors.contact_phone.message}</p>}
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kaydet
            </Button>
          </form>
        </CardContent>
      </Card>

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
              <p className="text-sm font-medium">Yeni Sipariş Bildirimleri</p>
              <p className="text-xs text-muted-foreground">Yeni sipariş atandığında bildirim al</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">E-posta Bildirimleri</p>
              <p className="text-xs text-muted-foreground">Günlük sipariş özeti e-postası</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">WhatsApp Bildirimleri</p>
              <p className="text-xs text-muted-foreground">Acil sipariş güncellemeleri için WhatsApp</p>
            </div>
            <Switch />
          </div>
          <Button variant="outline" size="sm">Tercihleri Kaydet</Button>
        </CardContent>
      </Card>
    </div>
  );
}
