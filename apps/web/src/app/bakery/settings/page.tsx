"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Store, Bell } from "lucide-react";
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

function SectionCard({ icon: Icon, title, children }: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-outline-variant/50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-base font-bold font-headline text-on-surface">{title}</h2>
        </div>
      </div>
      <div className="px-6 py-5">
        {children}
      </div>
    </div>
  );
}

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
        <h1 className="text-2xl font-bold font-headline text-on-surface">Ayarlar</h1>
        <p className="text-on-surface-variant text-sm mt-1">Pastane profili ve bildirim tercihlerinizi yönetin.</p>
      </div>

      <SectionCard icon={Store} title="Pastane Profili">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-on-surface">Pastane Adı</Label>
            <Input
              id="name"
              {...register("name")}
              className="rounded-xl border-outline-variant focus:border-primary"
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-on-surface">Açıklama</Label>
            <Textarea
              id="description"
              placeholder="Pastane hakkında kısa bilgi..."
              rows={2}
              className="rounded-xl border-outline-variant focus:border-primary resize-none"
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium text-on-surface">Adres</Label>
            <Input
              id="address"
              placeholder="Tam adres"
              className="rounded-xl border-outline-variant focus:border-primary"
              {...register("address")}
            />
            {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
          </div>

          <Separator className="bg-outline-variant/50" />

          <div className="space-y-2">
            <Label htmlFor="contact_name" className="text-sm font-medium text-on-surface">İletişim Kişisi</Label>
            <Input
              id="contact_name"
              className="rounded-xl border-outline-variant focus:border-primary"
              {...register("contact_name")}
            />
            {errors.contact_name && <p className="text-xs text-red-500">{errors.contact_name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_email" className="text-sm font-medium text-on-surface">E-posta</Label>
              <Input
                id="contact_email"
                type="email"
                className="rounded-xl border-outline-variant focus:border-primary"
                {...register("contact_email")}
              />
              {errors.contact_email && <p className="text-xs text-red-500">{errors.contact_email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone" className="text-sm font-medium text-on-surface">Telefon</Label>
              <Input
                id="contact_phone"
                type="tel"
                className="rounded-xl border-outline-variant focus:border-primary"
                {...register("contact_phone")}
              />
              {errors.contact_phone && <p className="text-xs text-red-500">{errors.contact_phone.message}</p>}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="rounded-xl gradient-primary text-white shadow-[0_10px_20px_-5px_rgba(157,67,0,0.3)]"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kaydet
          </Button>
        </form>
      </SectionCard>

      <SectionCard icon={Bell} title="Bildirim Tercihleri">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-on-surface">Yeni Sipariş Bildirimleri</p>
              <p className="text-xs text-on-surface-variant">Yeni sipariş atandığında bildirim al</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator className="bg-outline-variant/30" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-on-surface">E-posta Bildirimleri</p>
              <p className="text-xs text-on-surface-variant">Günlük sipariş özeti e-postası</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator className="bg-outline-variant/30" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-on-surface">WhatsApp Bildirimleri</p>
              <p className="text-xs text-on-surface-variant">Acil sipariş güncellemeleri için WhatsApp</p>
            </div>
            <Switch />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-outline-variant text-on-surface hover:bg-surface-container-low"
          >
            Tercihleri Kaydet
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
