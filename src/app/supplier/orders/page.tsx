import { requireAuth, requireSupplierUser } from "@/lib/auth";
import { supplierService } from "@/lib/services/supplier.service";
import { SupplierOrdersView } from "@/components/supplier/supplier-orders-view";

export const metadata = {
  title: "Siparişler | CakeDay",
  description: "Tüm siparişlerinizi yönetin.",
};

export default async function SupplierOrdersPage() {
  const user = await requireAuth();
  const supplierId = requireSupplierUser(user);

  const result = await supplierService.listSupplierOrders(
    supplierId,
    { page: 1, pageSize: 100, offset: 0, sort: "delivery_date", order: "asc" },
    {}
  );

  return (
    <SupplierOrdersView
      initialOrders={result.data as unknown as Parameters<typeof SupplierOrdersView>[0]["initialOrders"]}
    />
  );
}
