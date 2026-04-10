import { requireAuth, requireCompanyUser } from "@/lib/auth";
import { employeeService } from "@/lib/services/employee.service";
import { EmployeesView } from "@/components/employees/employees-view";

export const metadata = {
  title: "Çalışanlar | CakeDay",
  description: "Şirketinizdeki çalışanları yönetin ve doğum günlerini takip edin.",
};

export default async function EmployeesPage() {
  const user = await requireAuth();
  const companyId = requireCompanyUser(user);

  const result = await employeeService.listEmployees(
    companyId,
    { page: 1, pageSize: 50, offset: 0, sort: "first_name", order: "asc" },
    {}
  );

  return (
    <EmployeesView
      initialEmployees={result.data as Parameters<typeof EmployeesView>[0]["initialEmployees"]}
      totalCount={result.meta.totalCount}
    />
  );
}
