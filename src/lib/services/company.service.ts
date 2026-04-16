import { db } from '@/lib/db';
import {
  companies,
  contacts,
  addresses,
  companySettings,
} from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NotFoundError } from '@/lib/errors';
import type {
  UpdateCompanyProfileInput,
  UpdateCompanySettingsInput,
} from '@/lib/shared';

export class CompanyService {
  async getCompany(companyId: string) {
    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (!company) throw new NotFoundError('Company', companyId);
    return company;
  }

  async getContact(companyId: string) {
    const [company] = await db
      .select({ contact_id: companies.contact_id })
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (!company?.contact_id) return null;

    const [contact] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, company.contact_id))
      .limit(1);

    return contact ?? null;
  }

  async getAddress(companyId: string) {
    const [company] = await db
      .select({ address_id: companies.address_id })
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (!company?.address_id) return null;

    const [address] = await db
      .select()
      .from(addresses)
      .where(eq(addresses.id, company.address_id))
      .limit(1);

    return address ?? null;
  }

  async updateCompany(companyId: string, input: UpdateCompanyProfileInput) {
    const [updated] = await db
      .update(companies)
      .set({
        ...input,
        updated_at: new Date(),
      })
      .where(eq(companies.id, companyId))
      .returning();

    if (!updated) throw new NotFoundError('Company', companyId);
    return updated;
  }

  async getCompanySettings(companyId: string) {
    const [settings] = await db
      .select()
      .from(companySettings)
      .where(eq(companySettings.company_id, companyId))
      .limit(1);

    if (!settings) {
      // Auto-create if missing
      const [created] = await db
        .insert(companySettings)
        .values({ company_id: companyId })
        .returning();
      return created;
    }
    return settings;
  }

  async updateCompanySettings(companyId: string, input: UpdateCompanySettingsInput) {
    // Convert numeric fields to strings for Drizzle numeric columns
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { cancellation_fee_pct, ...rest } = input;
    const settingsDbFields: typeof rest & { cancellation_fee_pct?: string } = {
      ...rest,
      ...(cancellation_fee_pct !== undefined && {
        cancellation_fee_pct: String(cancellation_fee_pct),
      }),
    };

    const [settings] = await db
      .insert(companySettings)
      .values({ company_id: companyId, ...settingsDbFields })
      .onConflictDoUpdate({
        target: companySettings.company_id,
        set: { ...settingsDbFields, updated_at: new Date() },
      })
      .returning();

    return settings;
  }
}

export const companyService = new CompanyService();
