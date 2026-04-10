import { requireAuth, requireBakeryUser } from "@/lib/auth";
import { bakeryService } from "@/lib/services/bakery.service";
import { BakeryOrdersView } from "@/components/bakery/bakery-orders-view";

export const metadata = {
  title: "Siparişler | CakeDay",
  description: "Tüm siparişlerinizi yönetin.",
};

export default async function BakeryOrdersPage() {
  const user = await requireAuth();
  const bakeryId = requireBakeryUser(user);

  const result = await bakeryService.listBakeryOrders(
    bakeryId,
    { page: 1, pageSize: 100, offset: 0, sort: "delivery_date", order: "asc" },
    {}
  );

  return (
    <BakeryOrdersView
      initialOrders={result.data as Parameters<typeof BakeryOrdersView>[0]["initialOrders"]}
    />
  );
}
