"use client";

import { Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CAKE_SIZE_LABELS } from "@/lib/utils";
import type { OrderingRule } from "@cakeday/shared";

const RULE_TYPE_LABELS: Record<string, string> = {
  all_birthdays: "Tüm Doğum Günleri",
  round_birthdays: "Yuvarlak Doğum Günleri",
  work_anniversary: "İş Yıldönümü",
};

interface RuleCardProps {
  rule: OrderingRule;
  onEdit: (rule: OrderingRule) => void;
  onDelete: (rule: OrderingRule) => void;
  onToggle: (rule: OrderingRule, active: boolean) => void;
}

export function RuleCard({ rule, onEdit, onDelete, onToggle }: RuleCardProps) {
  return (
    <Card className={`border border-border transition-opacity ${rule.is_active ? "" : "opacity-60"}`}>
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold">{rule.name}</CardTitle>
          <Badge variant="secondary" className="mt-1 text-xs">
            {RULE_TYPE_LABELS[rule.rule_type] ?? rule.rule_type}
          </Badge>
        </div>
        <Switch
          checked={rule.is_active}
          onCheckedChange={(v) => onToggle(rule, v)}
        />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Pasta Boyutu</p>
            <p className="font-medium">
              {CAKE_SIZE_LABELS[rule.default_cake_size] ?? rule.default_cake_size}
            </p>
          </div>
          {rule.rule_type === "round_birthdays" && rule.milestone_ages && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Yaşlar</p>
              <p className="font-medium">{rule.milestone_ages.join(", ")}</p>
            </div>
          )}
          {rule.rule_type === "work_anniversary" && rule.anniversary_years && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Yıllar</p>
              <p className="font-medium">{rule.anniversary_years.join(", ")}</p>
            </div>
          )}
        </div>

        {rule.custom_text_template && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Pasta Mesajı</p>
            <p className="text-sm italic text-muted-foreground">"{rule.custom_text_template}"</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs">
            {rule.is_active ? (
              <>
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                <span className="text-green-700">Aktif</span>
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Pasif</span>
              </>
            )}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(rule)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => onDelete(rule)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
