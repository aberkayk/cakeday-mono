import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata = {
  title: "Dashboard | CakeDay",
  description: "Şirketinizin genel durumunu ve yaklaşan doğum günlerini takip edin.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
