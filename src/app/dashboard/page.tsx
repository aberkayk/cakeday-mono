import { requireAuth, requireCompanyUser } from "@/lib/auth";
import { employeeService } from "@/lib/services/employee.service";
import { orderService } from "@/lib/services/order.service";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata = {
  title: "Dashboard | CakeDay",
  description: "Şirketinizin genel durumunu ve yaklaşan doğum günlerini takip edin.",
};

export default async function DashboardPage() {
  const user = await requireAuth();
  const companyId = requireCompanyUser(user);

  const [employeesResult, ordersResult] = await Promise.all([
    employeeService.listEmployees(companyId, { page: 1, pageSize: 100, offset: 0, sort: "created_at", order: "desc" }, {}),
    orderService.listOrders(companyId, { page: 1, pageSize: 5, offset: 0, sort: "created_at", order: "desc" }, {}),
  ]);

  const firstName = user.email?.split("@")[0] ?? "Kullanıcı";

  return (
    <DashboardView
      employees={employeesResult.data as Parameters<typeof DashboardView>[0]["employees"]}
      totalEmployees={employeesResult.meta.totalCount}
      recentOrders={ordersResult.data as Parameters<typeof DashboardView>[0]["recentOrders"]}
      firstName={firstName}
    />
  );
}
