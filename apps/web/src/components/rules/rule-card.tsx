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
    color: "text-primary",
    borderColor: "border-l-primary",
    icon: Cake,
    badgeBg: "bg-primary-fixed text-on-primary-fixed-variant",
  },
  round_birthdays: {
    label: "Yuvarlak Doğum Günleri",
    color: "text-tertiary",
    borderColor: "border-l-tertiary",
    icon: Star,
    badgeBg: "bg-tertiary-container/30 text-tertiary",
  },
  work_anniversary: {
    label: "İş Yıldönümü",
    color: "text-secondary",
    borderColor: "border-l-secondary",
    icon: Briefcase,
    badgeBg: "bg-secondary-container/20 text-secondary",
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
    color: "text-on-surface-variant",
    borderColor: "border-l-outline",
    icon: Cake,
    badgeBg: "bg-surface-container text-on-surface-variant",
  };
  const Icon = config.icon;

  return (
    <div
      className={`bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant border-l-4 ${config.borderColor} transition-all ${
        rule.is_active ? "" : "opacity-60"
      } hover:shadow-md`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
              rule.is_active ? "bg-surface-container-low" : "bg-surface-container"
            }`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-on-surface truncate">{rule.name}</p>
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
            <span className="text-on-surface-variant">Pasta Boyutu</span>
            <span className="font-semibold text-on-surface">
              {CAKE_SIZE_LABELS[rule.default_cake_size] ?? rule.default_cake_size}
            </span>
          </div>

          {rule.rule_type === "round_birthdays" && rule.milestone_ages && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-on-surface-variant">Yuvarlak Yaşlar</span>
              <span className="font-semibold text-on-surface">{rule.milestone_ages.join(", ")}</span>
            </div>
          )}

          {rule.rule_type === "work_anniversary" && rule.anniversary_years && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-on-surface-variant">Yıldönümü Yılları</span>
              <span className="font-semibold text-on-surface">{rule.anniversary_years.join(", ")}</span>
            </div>
          )}
        </div>

        {rule.custom_text_template && (
          <div className="mb-4 bg-surface-container-low rounded-xl px-3 py-2.5 border-l-2 border-outline-variant">
            <p className="text-xs font-medium text-on-surface-variant mb-0.5">Mesaj Şablonu</p>
            <p className="text-xs italic text-on-surface-variant">"{rule.custom_text_template}"</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30">
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${rule.is_active ? "bg-tertiary" : "bg-on-surface-variant/30"}`} />
            <span className={`text-xs font-medium ${rule.is_active ? "text-tertiary" : "text-on-surface-variant/60"}`}>
              {rule.is_active ? "Aktif" : "Pasif"}
            </span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface"
              onClick={() => onEdit(rule)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl hover:bg-red-50 text-on-surface-variant/60 hover:text-red-500"
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
