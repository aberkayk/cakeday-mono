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
  name: z.string().min(1, "Tedarikçi adı gerekli."),
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
    <div className="bg-background rounded-2xl border border-border-soft shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-border-soft/50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-base font-bold font-headline text-foreground">{title}</h2>
        </div>
      </div>
      <div className="px-6 py-5">
        {children}
      </div>
    </div>
  );
}

export default function SupplierSettingsPage() {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      address: "",
      description: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 500));
    toast({ title: "Tedarikçi bilgileri güncellendi." });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold font-headline text-foreground">Ayarlar</h1>
        <p className="text-muted text-sm mt-1">Tedarikçi profili ve bildirim tercihlerinizi yönetin.</p>
      </div>

      <SectionCard icon={Store} title="Tedarikçi Profili">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">Tedarikçi Adı</Label>
            <Input
              id="name"
              {...register("name")}
              className="rounded-xl border-border-soft focus:border-primary"
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-foreground">Açıklama</Label>
            <Textarea
              id="description"
              placeholder="Tedarikçi hakkında kısa bilgi..."
              rows={2}
              className="rounded-xl border-border-soft focus:border-primary resize-none"
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium text-foreground">Adres</Label>
            <Input
              id="address"
              placeholder="Tam adres"
              className="rounded-xl border-border-soft focus:border-primary"
              {...register("address")}
            />
            {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="rounded-xl gradient-primary text-white shadow-primary"
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
              <p className="text-sm font-medium text-foreground">Yeni Sipariş Bildirimleri</p>
              <p className="text-xs text-muted">Yeni sipariş atandığında bildirim al</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator className="bg-border-soft/30" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">E-posta Bildirimleri</p>
              <p className="text-xs text-muted">Günlük sipariş özeti e-postası</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator className="bg-border-soft/30" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">WhatsApp Bildirimleri</p>
              <p className="text-xs text-muted">Acil sipariş güncellemeleri için WhatsApp</p>
            </div>
            <Switch />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-border-soft text-foreground hover:bg-background-secondary"
          >
            Tercihleri Kaydet
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
