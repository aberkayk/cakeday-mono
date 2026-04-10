import { requireAuth, requireCompanyUser } from "@/lib/auth";
import { companyService } from "@/lib/services/company.service";
import { SettingsView } from "@/components/dashboard/settings-view";

export const metadata = {
  title: "Ayarlar | CakeDay",
  description: "Profilinizi ve tercihlerinizi yönetin.",
};

export default async function SettingsPage() {
  const user = await requireAuth();
  const companyId = requireCompanyUser(user);

  const company = await companyService.getCompany(companyId);

  return (
    <SettingsView
      company={company as unknown as Parameters<typeof SettingsView>[0]["company"]}
    />
  );
}
