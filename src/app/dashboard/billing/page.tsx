import { requireAuth, requireCompanyUser } from "@/lib/auth";
import { BillingView } from "@/components/dashboard/billing-view";

export const metadata = {
  title: "Faturalama | CakeDay",
  description: "Ödeme yöntemleri ve fatura geçmişinizi yönetin.",
};

export default async function BillingPage() {
  const user = await requireAuth();
  requireCompanyUser(user);

  // Billing/invoices not yet implemented in services — render with empty data
  const invoices: Parameters<typeof BillingView>[0]["invoices"] = [];

  return <BillingView invoices={invoices} />;
}
