import { EmployeesView } from "@/components/employees/employees-view";

export const metadata = {
  title: "Çalışanlar | CakeDay",
  description: "Şirketinizdeki çalışanları yönetin ve doğum günlerini takip edin.",
};

export default function EmployeesPage() {
  return <EmployeesView />;
}
