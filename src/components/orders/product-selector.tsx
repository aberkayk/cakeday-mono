"use client";

import { Check } from "lucide-react";
import { cn, PRODUCT_SIZE_LABELS, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ProductType } from "@/lib/shared";

interface ProductSelectorProps {
  productTypes: ProductType[];
  selectedTypeId: string | null;
  selectedSize: string;
  onTypeChange: (id: string) => void;
  onSizeChange: (size: string) => void;
}

const MOCK_PRICES: Record<string, number> = {
  small: 280,
  medium: 420,
  large: 580,
};

const SIZE_CONFIG: Record<string, { emoji: string; desc: string }> = {
  small: { emoji: "🍰", desc: "2–4 kişilik" },
  medium: { emoji: "🎂", desc: "6–8 kişilik" },
  large: { emoji: "🎉", desc: "10–12 kişilik" },
};

export function ProductSelector({
  productTypes,
  selectedTypeId,
  selectedSize,
  onTypeChange,
  onSizeChange,
}: ProductSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Cake type selection */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">Pasta Türü</p>
        {productTypes.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl border-2 border-border-soft bg-background-secondary h-28 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {productTypes.map((cake) => (
              <button
                key={cake.id}
                type="button"
                onClick={() => onTypeChange(cake.id)}
                className={cn(
                  "relative rounded-2xl border-2 p-3 text-left transition-all hover:shadow-sm",
                  selectedTypeId === cake.id
                    ? "border-primary bg-primary/40 shadow-sm"
                    : "border-border-soft hover:border-primary/40 bg-background"
                )}
              >
                {selectedTypeId === cake.id && (
                  <span className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                )}
                <div className="h-14 w-full bg-gradient-to-br from-primary/20 to-primary/60 rounded-xl mb-2.5 flex items-center justify-center text-2xl">
                  🎂
                </div>
                <p className="text-sm font-semibold text-foreground truncate">{cake.name}</p>
                {(cake.is_gluten_free || cake.is_vegan) && (
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {cake.is_gluten_free && (
                      <Badge className="text-[10px] px-1.5 py-0 rounded-full bg-background-secondary text-muted border-0 font-semibold">GF</Badge>
                    )}
                    {cake.is_vegan && (
                      <Badge className="text-[10px] px-1.5 py-0 rounded-full bg-tertiary-container/30 text-tertiary border-0 font-semibold">Vegan</Badge>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Size selection */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">Pasta Boyutu</p>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(PRODUCT_SIZE_LABELS).map(([key, label]) => {
            const config = SIZE_CONFIG[key] ?? { emoji: "🎂", desc: "" };
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSizeChange(key)}
                className={cn(
                  "rounded-2xl border-2 p-4 text-center transition-all hover:shadow-sm",
                  selectedSize === key
                    ? "border-primary bg-primary/40 shadow-sm"
                    : "border-border-soft hover:border-primary/40 bg-background"
                )}
              >
                <p className="text-2xl mb-1.5">{config.emoji}</p>
                <p className="text-sm font-bold text-foreground">{label}</p>
                <p className="text-xs text-muted mt-0.5">{config.desc}</p>
                <p className="text-xs font-semibold text-primary mt-1.5">
                  {formatCurrency(MOCK_PRICES[key] ?? 0)}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
