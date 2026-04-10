import { requireAuth, requireCompanyUser } from "@/lib/auth";
import { orderingRuleService } from "@/lib/services/ordering-rule.service";
import { OrderingRulesView } from "@/components/rules/ordering-rules-view";

export const metadata = {
  title: "Sipariş Kuralları | CakeDay",
  description: "Otomatik sipariş kuralları ile operasyonunuzu kolaylaştırın.",
};

export default async function OrderingRulesPage() {
  const user = await requireAuth();
  const companyId = requireCompanyUser(user);

  const rules = await orderingRuleService.listRules(companyId);

  return (
    <OrderingRulesView
      initialRules={rules as Parameters<typeof OrderingRulesView>[0]["initialRules"]}
    />
  );
}
