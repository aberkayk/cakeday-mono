import { requireAuth, requireCompanyUser } from "@/lib/auth";
import { orderService } from "@/lib/services/order.service";
import { OrdersView } from "@/components/orders/orders-view";

export const metadata = {
  title: "Siparişlerim | CakeDay",
  description: "Tüm siparişlerinizi ve durumlarını takip edin.",
};

export default async function OrdersPage() {
  const user = await requireAuth();
  const companyId = requireCompanyUser(user);

  const result = await orderService.listOrders(
    companyId,
    { page: 1, pageSize: 100, offset: 0, sort: "created_at", order: "desc" },
    {}
  );

  return (
    <OrdersView
      initialOrders={result.data as Parameters<typeof OrdersView>[0]["initialOrders"]}
    />
  );
}
