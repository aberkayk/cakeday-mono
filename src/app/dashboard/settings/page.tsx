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

  const [company, contact, address] = await Promise.all([
    companyService.getCompany(companyId),
    companyService.getContact(companyId),
    companyService.getAddress(companyId),
  ]);

  return (
    <SettingsView
      company={company as unknown as Company}
      contact={contact as unknown as Contact | null}
      address={address as unknown as Address | null}
    />
  );
}
