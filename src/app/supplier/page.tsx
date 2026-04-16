import { requireAuth, requireSupplierUser } from "@/lib/auth";
import { supplierService } from "@/lib/services/supplier.service";
import { SupplierDashboardView } from "@/components/supplier/supplier-dashboard-view";

export const metadata = {
  title: "Tedarikçi Paneli | CakeDay",
  description: "Gelen siparişleri ve günlük teslimatları yönetin.",
};

export default async function SupplierDashboardPage() {
  const user = await requireAuth();
  const supplierId = requireSupplierUser(user);

  const result = await supplierService.listSupplierOrders(
    supplierId,
    { page: 1, pageSize: 50, offset: 0, sort: "delivery_date", order: "asc" },
    {}
  );

  return (
    <SupplierDashboardView
      initialOrders={result.data as unknown as Parameters<typeof SupplierDashboardView>[0]["initialOrders"]}
    />
  );
}
