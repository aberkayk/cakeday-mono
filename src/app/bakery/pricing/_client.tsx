"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tag, Plus, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { requestPriceChange } from "@/actions/bakery";
import { formatCurrency, CAKE_SIZE_LABELS } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { CakeType } from "@/lib/shared";

const MOCK_CURRENT_PRICES: Record<string, Record<string, number>> = {
  small: { default: 280 },
  medium: { default: 420 },
  large: { default: 580 },
};

const requestSchema = z.object({
  cake_type_id: z.string().min(1, "Pasta türü seçin."),
  size: z.enum(["small", "medium", "large"]),
  requested_price_try: z.number().min(1, "Fiyat gerekli."),
  effective_date: z.string().min(1, "Geçerlilik tarihi seçin."),
  justification: z.string().optional(),
});
type RequestFormData = z.infer<typeof requestSchema>;

interface BakeryPricingClientProps {
  cakeTypes: CakeType[];
}

export function BakeryPricingClient({ cakeTypes }: BakeryPricingClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: { size: "medium" },
  });

  const onSubmit = async (data: RequestFormData) => {
    try {
      await requestPriceChange(data);
      setSubmitted(true);
      toast({ title: "Fiyat değişiklik talebi gönderildi." });
      reset();
    } catch (err) {
      toast({
        title: "Hata",
        description: err instanceof Error ? err.message : "Talep gönderilemedi.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline text-foreground">Fiyatlandırma</h1>
          <p className="text-muted text-sm mt-1">Mevcut fiyatlar ve fiyat değişiklik talepleri.</p>
        </div>
        <Button
          onClick={() => { setDialogOpen(true); setSubmitted(false); }}
          className="rounded-xl gradient-primary text-white shadow-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          Fiyat Değişikliği Talep Et
        </Button>
      </div>

      {/* Current prices */}
      <div className="bg-background rounded-2xl shadow-sm border border-border-soft">
        <div className="px-6 py-5 border-b border-border-soft/50">
          <h2 className="text-base font-semibold font-headline text-foreground flex items-center gap-2">
            <Tag className="h-5 w-5 text-muted" />
            Mevcut Fiyatlar
          </h2>
        </div>
        <div className="px-6 py-5">
          {cakeTypes.length === 0 ? (
            <p className="text-sm text-muted">Katalogda pasta türü bulunamadı.</p>
          ) : (
            <div className="space-y-4">
              {cakeTypes.map((cake) => (
                <div key={cake.id} className="rounded-xl border border-border-soft p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🎂</span>
                      <div>
                        <p className="font-medium text-sm text-foreground">{cake.name}</p>
                        {cake.is_gluten_free && (
                          <Badge className="text-xs mt-0.5 bg-background-secondary text-muted border-0">Glutensiz</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {(["small", "medium", "large"] as const).map((size) => (
                      <div key={size} className="text-center rounded-xl bg-background-secondary p-2">
                        <p className="text-xs text-muted mb-1">{CAKE_SIZE_LABELS[size]}</p>
                        <p className="font-semibold text-sm text-foreground">
                          {formatCurrency(MOCK_CURRENT_PRICES[size]?.["default"] ?? 0)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Price change request dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-foreground">Fiyat Değişikliği Talep Et</DialogTitle>
          </DialogHeader>

          {submitted ? (
            <div className="py-6 text-center space-y-3">
              <CheckCircle2 className="mx-auto h-12 w-12 text-tertiary" />
              <p className="font-medium text-foreground">Talebiniz iletildi!</p>
              <p className="text-sm text-muted">Admin inceledikten sonra size bildirim gönderilecek.</p>
              <Button
                onClick={() => setDialogOpen(false)}
                className="rounded-xl gradient-primary text-white shadow-primary"
              >
                Kapat
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">Pasta Türü</Label>
                <Select onValueChange={(v) => setValue("cake_type_id", v)}>
                  <SelectTrigger className="rounded-xl border-border-soft">
                    <SelectValue placeholder="Pasta seçin" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {cakeTypes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.cake_type_id && <p className="text-xs text-red-500">{errors.cake_type_id.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Boyut</Label>
                <Select defaultValue="medium" onValueChange={(v) => setValue("size", v as "small" | "medium" | "large")}>
                  <SelectTrigger className="rounded-xl border-border-soft"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {Object.entries(CAKE_SIZE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requested_price_try" className="text-foreground">Talep Edilen Fiyat (TL)</Label>
                <Input
                  id="requested_price_try"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="450.00"
                  className="rounded-xl border-border-soft focus:border-primary"
                  {...register("requested_price_try", { valueAsNumber: true })}
                />
                {errors.requested_price_try && <p className="text-xs text-red-500">{errors.requested_price_try.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="effective_date" className="text-foreground">Geçerlilik Tarihi</Label>
                <Input
                  id="effective_date"
                  type="date"
                  className="rounded-xl border-border-soft focus:border-primary"
                  {...register("effective_date")}
                />
                {errors.effective_date && <p className="text-xs text-red-500">{errors.effective_date.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="justification" className="text-foreground">Gerekçe</Label>
                <Textarea
                  id="justification"
                  placeholder="Fiyat artışının gerekçesini yazın..."
                  rows={3}
                  className="rounded-xl border-border-soft focus:border-primary resize-none"
                  {...register("justification")}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl border-border-soft">İptal</Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl gradient-primary text-white shadow-primary"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Talep Gönder
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
