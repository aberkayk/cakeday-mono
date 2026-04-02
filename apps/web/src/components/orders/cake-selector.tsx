"use client";

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

const SIZE_CONFIG: Record<string, { emoji: string; desc: string }> = {
  small: { emoji: "🍰", desc: "2–4 kişilik" },
  medium: { emoji: "🎂", desc: "6–8 kişilik" },
  large: { emoji: "🎉", desc: "10–12 kişilik" },
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
        <p className="text-sm font-semibold text-gray-700 mb-3">Pasta Türü</p>
        {cakeTypes.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl border-2 border-gray-100 bg-gray-50 h-28 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {cakeTypes.map((cake) => (
              <button
                key={cake.id}
                type="button"
                onClick={() => onTypeChange(cake.id)}
                className={cn(
                  "relative rounded-2xl border-2 p-3 text-left transition-all hover:shadow-sm",
                  selectedTypeId === cake.id
                    ? "border-coral-400 bg-coral-50/50 shadow-sm"
                    : "border-gray-100 hover:border-coral-200 bg-white"
                )}
              >
                {selectedTypeId === cake.id && (
                  <span className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-coral-500 flex items-center justify-center shadow-sm">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                )}
                <div className="h-14 w-full bg-gradient-to-br from-coral-50 to-orange-50 rounded-xl mb-2.5 flex items-center justify-center text-2xl">
                  🎂
                </div>
                <p className="text-sm font-semibold text-gray-900 truncate">{cake.name}</p>
                {(cake.is_gluten_free || cake.is_vegan) && (
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {cake.is_gluten_free && (
                      <Badge className="text-[10px] px-1.5 py-0 rounded-full bg-green-50 text-green-700 border-0 font-semibold">GF</Badge>
                    )}
                    {cake.is_vegan && (
                      <Badge className="text-[10px] px-1.5 py-0 rounded-full bg-purple-50 text-purple-700 border-0 font-semibold">Vegan</Badge>
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
        <p className="text-sm font-semibold text-gray-700 mb-3">Pasta Boyutu</p>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(CAKE_SIZE_LABELS).map(([key, label]) => {
            const config = SIZE_CONFIG[key] ?? { emoji: "🎂", desc: "" };
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSizeChange(key)}
                className={cn(
                  "rounded-2xl border-2 p-4 text-center transition-all hover:shadow-sm",
                  selectedSize === key
                    ? "border-coral-400 bg-coral-50/50 shadow-sm"
                    : "border-gray-100 hover:border-coral-200 bg-white"
                )}
              >
                <p className="text-2xl mb-1.5">{config.emoji}</p>
                <p className="text-sm font-bold text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{config.desc}</p>
                <p className="text-xs font-semibold text-coral-600 mt-1.5">
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
