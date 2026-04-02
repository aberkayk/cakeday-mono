"use client";

import { Pencil, Trash2, Cake, Star, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CAKE_SIZE_LABELS } from "@/lib/utils";
import type { OrderingRule } from "@cakeday/shared";

const RULE_TYPE_CONFIG: Record<string, { label: string; color: string; borderColor: string; icon: React.ElementType; badgeBg: string }> = {
  all_birthdays: {
    label: "Tüm Doğum Günleri",
    color: "text-coral-600",
    borderColor: "border-l-coral-400",
    icon: Cake,
    badgeBg: "bg-coral-50 text-coral-700",
  },
  round_birthdays: {
    label: "Yuvarlak Doğum Günleri",
    color: "text-purple-600",
    borderColor: "border-l-purple-400",
    icon: Star,
    badgeBg: "bg-purple-50 text-purple-700",
  },
  work_anniversary: {
    label: "İş Yıldönümü",
    color: "text-blue-600",
    borderColor: "border-l-blue-400",
    icon: Briefcase,
    badgeBg: "bg-blue-50 text-blue-700",
  },
};

interface RuleCardProps {
  rule: OrderingRule;
  onEdit: (rule: OrderingRule) => void;
  onDelete: (rule: OrderingRule) => void;
  onToggle: (rule: OrderingRule, active: boolean) => void;
}

export function RuleCard({ rule, onEdit, onDelete, onToggle }: RuleCardProps) {
  const config = RULE_TYPE_CONFIG[rule.rule_type] ?? {
    label: rule.rule_type,
    color: "text-gray-600",
    borderColor: "border-l-gray-400",
    icon: Cake,
    badgeBg: "bg-gray-100 text-gray-600",
  };
  const Icon = config.icon;

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${config.borderColor} transition-all ${
        rule.is_active ? "" : "opacity-60"
      } hover:shadow-md`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
              rule.is_active ? "bg-gray-50" : "bg-gray-100"
            }`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{rule.name}</p>
              <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.badgeBg}`}>
                {config.label}
              </span>
            </div>
          </div>
          <Switch
            checked={rule.is_active}
            onCheckedChange={(v) => onToggle(rule, v)}
          />
        </div>

        {/* Details */}
        <div className="space-y-2.5 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Pasta Boyutu</span>
            <span className="font-semibold text-gray-800">
              {CAKE_SIZE_LABELS[rule.default_cake_size] ?? rule.default_cake_size}
            </span>
          </div>

          {rule.rule_type === "round_birthdays" && rule.milestone_ages && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Yuvarlak Yaşlar</span>
              <span className="font-semibold text-gray-800">{rule.milestone_ages.join(", ")}</span>
            </div>
          )}

          {rule.rule_type === "work_anniversary" && rule.anniversary_years && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Yıldönümü Yılları</span>
              <span className="font-semibold text-gray-800">{rule.anniversary_years.join(", ")}</span>
            </div>
          )}
        </div>

        {rule.custom_text_template && (
          <div className="mb-4 bg-gray-50 rounded-xl px-3 py-2.5 border-l-2 border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-0.5">Mesaj Şablonu</p>
            <p className="text-xs italic text-gray-600">"{rule.custom_text_template}"</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${rule.is_active ? "bg-green-500" : "bg-gray-300"}`} />
            <span className={`text-xs font-medium ${rule.is_active ? "text-green-700" : "text-gray-400"}`}>
              {rule.is_active ? "Aktif" : "Pasif"}
            </span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              onClick={() => onEdit(rule)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500"
              onClick={() => onDelete(rule)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
