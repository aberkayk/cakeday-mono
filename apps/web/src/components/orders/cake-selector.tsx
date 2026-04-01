"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn, CAKE_SIZE_LABELS, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { CakeType } from "@cakeday/shared";

interface CakeSelectorProps {
  cakeTypes: CakeType[];
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

export function CakeSelector({
  cakeTypes,
  selectedTypeId,
  selectedSize,
  onTypeChange,
  onSizeChange,
}: CakeSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Cake type selection */}
      <div>
        <p className="text-sm font-medium mb-3">Pasta Türü</p>
        {cakeTypes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Yükleniyor...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {cakeTypes.map((cake) => (
              <button
                key={cake.id}
                type="button"
                onClick={() => onTypeChange(cake.id)}
                className={cn(
                  "relative rounded-xl border-2 p-3 text-left transition-all hover:border-primary/50",
                  selectedTypeId === cake.id ? "border-primary bg-primary/5" : "border-border"
                )}
              >
                {selectedTypeId === cake.id && (
                  <span className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                )}
                <div className="h-16 w-full bg-muted rounded-lg mb-2 flex items-center justify-center text-2xl">
                  🎂
                </div>
                <p className="text-sm font-medium truncate">{cake.name}</p>
                {(cake.is_gluten_free || cake.is_vegan) && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {cake.is_gluten_free && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">GF</Badge>
                    )}
                    {cake.is_vegan && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">Vegan</Badge>
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
        <p className="text-sm font-medium mb-3">Pasta Boyutu</p>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(CAKE_SIZE_LABELS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => onSizeChange(key)}
              className={cn(
                "rounded-xl border-2 p-3 text-center transition-all hover:border-primary/50",
                selectedSize === key ? "border-primary bg-primary/5" : "border-border"
              )}
            >
              <p className="text-lg mb-1">
                {key === "small" ? "🍰" : key === "medium" ? "🎂" : "🎉"}
              </p>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatCurrency(MOCK_PRICES[key] ?? 0)}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
