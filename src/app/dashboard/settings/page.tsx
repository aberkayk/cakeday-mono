import { requireAuth, requireCompanyUser } from "@/lib/auth";
import { companyService } from "@/lib/services/company.service";
import { SettingsView } from "@/components/dashboard/settings-view";
import type { Company, Contact, Address } from "@/lib/shared";

export const metadata = {
  title: "Ayarlar | CakeDay",
  description: "Profilinizi ve tercihlerinizi yönetin.",
};

export default async function SettingsPage() {
  const user = await requireAuth();
  const companyId = requireCompanyUser(user);

  const [company, contacts, addresses] = await Promise.all([
    companyService.getCompany(companyId),
    companyService.getContacts(companyId),
    companyService.getAddresses(companyId),
  ]);

  return (
    <SettingsView
      company={company as unknown as Company}
      contacts={contacts as unknown as Contact[]}
      addresses={addresses as unknown as Address[]}
    />
  );
}
