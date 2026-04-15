import { requireAuth, requireBakeryUser } from "@/lib/auth";
import { bakeryService } from "@/lib/services/bakery.service";
import { BakeryDashboardView } from "@/components/bakery/bakery-dashboard-view";

export const metadata = {
  title: "Pastane Paneli | CakeDay",
  description: "Gelen siparişleri ve günlük teslimatları yönetin.",
};

export default async function BakeryDashboardPage() {
  const user = await requireAuth();
  const bakeryId = requireBakeryUser(user);

  const result = await bakeryService.listBakeryOrders(
    bakeryId,
    { page: 1, pageSize: 50, offset: 0, sort: "delivery_date", order: "asc" },
    {}
  );

  return (
    <BakeryDashboardView
      initialOrders={result.data as unknown as Parameters<typeof BakeryDashboardView>[0]["initialOrders"]}
    />
  );
}
