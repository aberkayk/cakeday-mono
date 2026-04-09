"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, User, MapPin, Cake, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CakeSelector } from "./cake-selector";
import { catalogueApi } from "@/lib/api";
import { DISTRICT_LABELS } from "@/lib/utils";
import type { CakeType } from "@cakeday/shared";

const schema = z.object({
  recipient_name: z.string().min(1, "Alıcı adı gerekli."),
  recipient_phone: z.string().optional(),
  delivery_date: z.string().min(1, "Teslimat tarihi gerekli."),
  delivery_address: z.string().min(5, "Teslimat adresi gerekli."),
  delivery_district: z.string().min(1, "İlçe seçin."),
  delivery_window: z.enum(["morning", "afternoon", "no_preference"]),
  custom_text: z.string().optional(),
  cake_type_id: z.string().min(1, "Pasta türü seçin."),
  cake_size: z.enum(["small", "medium", "large"]),
});
type FormData = z.infer<typeof schema>;

interface OrderFormProps {
  onSubmit: (data: Partial<FormData>) => Promise<void>;
}

function SectionCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-background rounded-2xl border border-border-soft shadow-sm p-6 space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-xl bg-primary/20 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-base font-bold font-headline text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export function OrderForm({ onSubmit }: OrderFormProps) {
  const [cakeTypes, setCakeTypes] = useState<CakeType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("medium");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { delivery_window: "no_preference", cake_size: "medium" },
  });

  useEffect(() => {
    catalogueApi.list().then((res) => {
      setCakeTypes(res.data);
      if (res.data[0]) {
        setSelectedTypeId(res.data[0].id);
        setValue("cake_type_id", res.data[0].id);
      }
    });
  }, [setValue]);

  const handleTypeChange = (id: string) => {
    setSelectedTypeId(id);
    setValue("cake_type_id", id);
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    setValue("cake_size", size as FormData["cake_size"]);
  };

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit({
      ...data,
      cake_type_id: selectedTypeId ?? undefined,
      cake_size: selectedSize as FormData["cake_size"],
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Recipient Info */}
      <SectionCard icon={User} title="Alıcı Bilgileri">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="recipient_name" className="text-sm font-medium text-foreground">Alıcı Adı Soyadı *</Label>
            <Input
              id="recipient_name"
              placeholder="Ad Soyad"
              {...register("recipient_name")}
              className="rounded-xl border-border-soft focus:border-primary"
            />
            {errors.recipient_name && <p className="text-xs text-red-500">{errors.recipient_name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="recipient_phone" className="text-sm font-medium text-foreground">Telefon</Label>
            <Input
              id="recipient_phone"
              type="tel"
              placeholder="05XX XXX XX XX"
              {...register("recipient_phone")}
              className="rounded-xl border-border-soft focus:border-primary"
            />
          </div>
        </div>
      </SectionCard>

      {/* Delivery Info */}
      <SectionCard icon={MapPin} title="Teslimat Bilgileri">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="delivery_date" className="text-sm font-medium text-foreground">Teslimat Tarihi *</Label>
            <Input
              id="delivery_date"
              type="date"
              {...register("delivery_date")}
              className="rounded-xl border-border-soft focus:border-primary"
            />
            {errors.delivery_date && <p className="text-xs text-red-500">{errors.delivery_date.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">Teslimat İlçesi *</Label>
            <Select onValueChange={(v) => setValue("delivery_district", v)}>
              <SelectTrigger className="rounded-xl border-border-soft">
                <SelectValue placeholder="İlçe seçin" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {Object.entries(DISTRICT_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.delivery_district && <p className="text-xs text-red-500">{errors.delivery_district.message}</p>}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="delivery_address" className="text-sm font-medium text-foreground">Teslimat Adresi *</Label>
          <Input
            id="delivery_address"
            placeholder="Mahalle, sokak, bina no, daire no"
            {...register("delivery_address")}
            className="rounded-xl border-border-soft focus:border-primary"
          />
          {errors.delivery_address && <p className="text-xs text-red-500">{errors.delivery_address.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Teslimat Saati</Label>
          <Select
            defaultValue="no_preference"
            onValueChange={(v) => setValue("delivery_window", v as FormData["delivery_window"])}
          >
            <SelectTrigger className="rounded-xl border-border-soft">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="morning">🌅 Sabah (09:00 - 13:00)</SelectItem>
              <SelectItem value="afternoon">☀️ Öğleden Sonra (13:00 - 18:00)</SelectItem>
              <SelectItem value="no_preference">🕐 Fark Etmez</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SectionCard>

      {/* Cake Selection */}
      <SectionCard icon={Cake} title="Pasta Seçimi">
        <CakeSelector
          cakeTypes={cakeTypes}
          selectedTypeId={selectedTypeId}
          selectedSize={selectedSize}
          onTypeChange={handleTypeChange}
          onSizeChange={handleSizeChange}
        />
        {errors.cake_type_id && <p className="text-xs text-red-500">{errors.cake_type_id.message}</p>}
      </SectionCard>

      {/* Custom Message */}
      <SectionCard icon={MessageSquare} title="Pasta Mesajı">
        <div className="space-y-1.5">
          <Label htmlFor="custom_text" className="text-sm font-medium text-foreground">Pasta Üzerine Yazılacak Mesaj</Label>
          <Textarea
            id="custom_text"
            placeholder="İyi ki doğdun Ayşe! 🎂"
            maxLength={100}
            rows={2}
            {...register("custom_text")}
            className="rounded-xl border-border-soft focus:border-primary resize-none"
          />
          <p className="text-xs text-muted">Maksimum 100 karakter.</p>
        </div>
      </SectionCard>

      <Button
        type="submit"
        className="w-full rounded-xl gradient-primary text-white shadow-primary h-12 text-base font-semibold"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Sipariş Oluşturuluyor...
          </>
        ) : (
          "Sipariş Ver"
        )}
      </Button>
    </form>
  );
}
