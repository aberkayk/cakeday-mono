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
import { CAKE_SIZE_LABELS } from "@/lib/utils";
import type { OrderingRule } from "@cakeday/shared";

const schema = z.object({
  name: z.string().min(1, "Kural adı gerekli."),
  rule_type: z.enum(["all_birthdays", "round_birthdays", "work_anniversary"]),
  default_cake_size: z.enum(["small", "medium", "large"]),
  milestone_ages: z.string().optional(),
  anniversary_years: z.string().optional(),
  custom_text_template: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface RuleFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<OrderingRule>) => Promise<void>;
  rule?: OrderingRule | null;
}

export function RuleForm({ open, onClose, onSubmit, rule }: RuleFormProps) {
  const isEdit = !!rule;
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { rule_type: "all_birthdays", default_cake_size: "medium" },
  });

  const ruleType = watch("rule_type");

  useEffect(() => {
    if (rule) {
      reset({
        name: rule.name,
        rule_type: rule.rule_type,
        default_cake_size: rule.default_cake_size,
        milestone_ages: rule.milestone_ages?.join(", ") ?? "",
        anniversary_years: rule.anniversary_years?.join(", ") ?? "",
        custom_text_template: rule.custom_text_template ?? "",
      });
    } else {
      reset({ rule_type: "all_birthdays", default_cake_size: "medium" });
    }
  }, [rule, reset]);

  const handleFormSubmit = async (data: FormData) => {
    const parsedMilestoneAges = data.milestone_ages
      ? data.milestone_ages.split(",").map((v) => parseInt(v.trim())).filter(Boolean)
      : null;
    const parsedAnniversaryYears = data.anniversary_years
      ? data.anniversary_years.split(",").map((v) => parseInt(v.trim())).filter(Boolean)
      : null;

    await onSubmit({
      name: data.name,
      rule_type: data.rule_type,
      default_cake_size: data.default_cake_size,
      milestone_ages: parsedMilestoneAges,
      anniversary_years: parsedAnniversaryYears,
      custom_text_template: data.custom_text_template || null,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-bold text-gray-900">
            {isEdit ? "Kuralı Düzenle" : "Yeni Kural Oluştur"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Basic */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kural Bilgileri</p>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">Kural Adı *</Label>
              <Input
                id="name"
                placeholder="Tüm Çalışanlar — Doğum Günü"
                {...register("name")}
                className="rounded-xl border-gray-200 focus:border-coral-300"
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Kural Tipi *</Label>
              <Select
                defaultValue={rule?.rule_type ?? "all_birthdays"}
                onValueChange={(v) => setValue("rule_type", v as FormData["rule_type"])}
              >
                <SelectTrigger className="rounded-xl border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all_birthdays">🎂 Tüm Doğum Günleri</SelectItem>
                  <SelectItem value="round_birthdays">⭐ Yuvarlak Doğum Günleri</SelectItem>
                  <SelectItem value="work_anniversary">💼 İş Yıldönümü</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conditional fields */}
          {ruleType === "round_birthdays" && (
            <div className="space-y-1.5 rounded-xl bg-purple-50/50 border border-purple-100 p-4">
              <Label htmlFor="milestone_ages" className="text-sm font-medium text-gray-700">Yuvarlak Yaşlar</Label>
              <Input
                id="milestone_ages"
                placeholder="30, 40, 50"
                {...register("milestone_ages")}
                className="rounded-xl border-gray-200 focus:border-purple-300 bg-white"
              />
              <p className="text-xs text-gray-500">Virgülle ayırın. Örn: 30, 40, 50</p>
            </div>
          )}

          {ruleType === "work_anniversary" && (
            <div className="space-y-1.5 rounded-xl bg-blue-50/50 border border-blue-100 p-4">
              <Label htmlFor="anniversary_years" className="text-sm font-medium text-gray-700">Yıldönümü Yılları</Label>
              <Input
                id="anniversary_years"
                placeholder="1, 3, 5, 10"
                {...register("anniversary_years")}
                className="rounded-xl border-gray-200 focus:border-blue-300 bg-white"
              />
              <p className="text-xs text-gray-500">Virgülle ayırın. Örn: 1, 3, 5, 10</p>
            </div>
          )}

          {/* Cake config */}
          <div className="space-y-4 pt-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pasta Ayarları</p>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Varsayılan Pasta Boyutu *</Label>
              <Select
                defaultValue={rule?.default_cake_size ?? "medium"}
                onValueChange={(v) => setValue("default_cake_size", v as FormData["default_cake_size"])}
              >
                <SelectTrigger className="rounded-xl border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {Object.entries(CAKE_SIZE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="custom_text_template" className="text-sm font-medium text-gray-700">Pasta Mesajı Şablonu</Label>
              <Textarea
                id="custom_text_template"
                placeholder="İyi ki doğdun {{ad}}! 🎂"
                rows={2}
                {...register("custom_text_template")}
                className="rounded-xl border-gray-200 focus:border-coral-300 resize-none"
              />
              <p className="text-xs text-gray-400">{"{{ad}} çalışan adıyla otomatik değiştirilir."}</p>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl border-gray-200">
              İptal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-coral-500 hover:bg-coral-600 text-white"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Güncelle" : "Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
