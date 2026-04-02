"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DISTRICT_LABELS, CAKE_SIZE_LABELS } from "@/lib/utils";
import type { Employee } from "@cakeday/shared";

const schema = z.object({
  first_name: z.string().min(1, "Ad gerekli."),
  last_name: z.string().min(1, "Soyad gerekli."),
  date_of_birth: z.string().min(1, "Doğum tarihi gerekli."),
  department: z.string().optional(),
  work_email: z.string().email("Geçerli e-posta girin.").optional().or(z.literal("")),
  personal_email: z.string().email("Geçerli e-posta girin.").optional().or(z.literal("")),
  delivery_address: z.string().optional(),
  delivery_district: z.string().optional(),
  custom_message_override: z.string().optional(),
  preferred_cake_size: z.string().optional(),
  skip_cake: z.boolean().optional(),
  office_location: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface EmployeeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Employee>) => Promise<void>;
  employee?: Employee | null;
}

export function EmployeeForm({ open, onClose, onSubmit, employee }: EmployeeFormProps) {
  const isEdit = !!employee;
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { skip_cake: false },
  });

  useEffect(() => {
    if (employee) {
      reset({
        first_name: employee.first_name,
        last_name: employee.last_name,
        date_of_birth: employee.date_of_birth?.slice(0, 10),
        department: employee.department ?? "",
        work_email: employee.work_email ?? "",
        personal_email: employee.personal_email ?? "",
        delivery_address: employee.delivery_address ?? "",
        delivery_district: employee.delivery_district ?? "",
        custom_message_override: employee.custom_message_override ?? "",
        preferred_cake_size: employee.preferred_cake_size ?? "",
        skip_cake: employee.skip_cake,
        office_location: employee.office_location ?? "",
      });
    } else {
      reset({ skip_cake: false });
    }
  }, [employee, reset]);

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit({
      first_name: data.first_name,
      last_name: data.last_name,
      date_of_birth: data.date_of_birth,
      department: data.department || undefined,
      work_email: data.work_email || undefined,
      personal_email: data.personal_email || undefined,
      delivery_address: data.delivery_address || undefined,
      delivery_district: (data.delivery_district as Employee["delivery_district"]) || undefined,
      custom_message_override: data.custom_message_override || undefined,
      preferred_cake_size: (data.preferred_cake_size as Employee["preferred_cake_size"]) || undefined,
      skip_cake: data.skip_cake ?? false,
      office_location: data.office_location || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-bold font-headline text-on-surface">
            {isEdit ? "Çalışanı Düzenle" : "Yeni Çalışan Ekle"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Kişisel Bilgiler</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="first_name" className="text-sm font-medium text-on-surface">Ad *</Label>
                <Input
                  id="first_name"
                  {...register("first_name")}
                  className="rounded-xl border-outline-variant focus:border-primary"
                  placeholder="Ayşe"
                />
                {errors.first_name && <p className="text-xs text-red-500">{errors.first_name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last_name" className="text-sm font-medium text-on-surface">Soyad *</Label>
                <Input
                  id="last_name"
                  {...register("last_name")}
                  className="rounded-xl border-outline-variant focus:border-primary"
                  placeholder="Yılmaz"
                />
                {errors.last_name && <p className="text-xs text-red-500">{errors.last_name.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date_of_birth" className="text-sm font-medium text-on-surface">Doğum Tarihi *</Label>
              <Input
                id="date_of_birth"
                type="date"
                {...register("date_of_birth")}
                className="rounded-xl border-outline-variant focus:border-primary"
              />
              {errors.date_of_birth && <p className="text-xs text-red-500">{errors.date_of_birth.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="department" className="text-sm font-medium text-on-surface">Departman</Label>
                <Input
                  id="department"
                  placeholder="Mühendislik"
                  {...register("department")}
                  className="rounded-xl border-outline-variant focus:border-primary"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="office_location" className="text-sm font-medium text-on-surface">Ofis Konumu</Label>
                <Input
                  id="office_location"
                  placeholder="İstanbul Merkez"
                  {...register("office_location")}
                  className="rounded-xl border-outline-variant focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="space-y-4 pt-1">
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">İletişim Bilgileri</p>

            <div className="space-y-1.5">
              <Label htmlFor="work_email" className="text-sm font-medium text-on-surface">İş E-postası</Label>
              <Input
                id="work_email"
                type="email"
                placeholder="ayse@sirket.com"
                {...register("work_email")}
                className="rounded-xl border-outline-variant focus:border-primary"
              />
              {errors.work_email && <p className="text-xs text-red-500">{errors.work_email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="personal_email" className="text-sm font-medium text-on-surface">Kişisel E-posta</Label>
              <Input
                id="personal_email"
                type="email"
                placeholder="kisisel@mail.com"
                {...register("personal_email")}
                className="rounded-xl border-outline-variant focus:border-primary"
              />
              {errors.personal_email && <p className="text-xs text-red-500">{errors.personal_email.message}</p>}
            </div>
          </div>

          {/* Delivery Section */}
          <div className="space-y-4 pt-1">
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Teslimat Bilgileri</p>

            <div className="space-y-1.5">
              <Label htmlFor="delivery_address" className="text-sm font-medium text-on-surface">Teslimat Adresi</Label>
              <Input
                id="delivery_address"
                placeholder="Tam adres"
                {...register("delivery_address")}
                className="rounded-xl border-outline-variant focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-on-surface">Teslimat İlçesi</Label>
              <Select
                defaultValue={employee?.delivery_district ?? ""}
                onValueChange={(v) => setValue("delivery_district", v)}
              >
                <SelectTrigger className="rounded-xl border-outline-variant">
                  <SelectValue placeholder="İlçe seçin" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {Object.entries(DISTRICT_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cake Preferences Section */}
          <div className="space-y-4 pt-1">
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Pasta Tercihleri</p>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-on-surface">Tercih Edilen Pasta Boyutu</Label>
              <Select
                defaultValue={employee?.preferred_cake_size ?? ""}
                onValueChange={(v) => setValue("preferred_cake_size", v)}
              >
                <SelectTrigger className="rounded-xl border-outline-variant">
                  <SelectValue placeholder="Boyut seçin" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {Object.entries(CAKE_SIZE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="custom_message_override" className="text-sm font-medium text-on-surface">Özel Mesaj</Label>
              <Textarea
                id="custom_message_override"
                placeholder="İyi ki doğdun {{ad}}!"
                rows={2}
                {...register("custom_message_override")}
                className="rounded-xl border-outline-variant focus:border-primary resize-none"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-outline-variant bg-surface-container-low/50 p-4">
              <div>
                <p className="text-sm font-semibold text-on-surface">Pasta Gönderimini Atla</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Bu çalışana pasta gönderilmez.</p>
              </div>
              <Switch
                checked={watch("skip_cake") ?? false}
                onCheckedChange={(v) => setValue("skip_cake", v)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl border-outline-variant">
              İptal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl gradient-primary text-white shadow-[0_10px_20px_-5px_rgba(157,67,0,0.3)]"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Güncelle" : "Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
