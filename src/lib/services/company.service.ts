import { db } from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  companies,
  companyMemberships,
  companySettings,
  profiles,
} from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { NotFoundError, ForbiddenError, ConflictError, BadRequestError } from '@/lib/errors';
import type {
  UpdateCompanyProfileInput,
  UpdateCompanySettingsInput,
  InviteUserInput,
} from '@/lib/shared';
import { v4 as uuidv4 } from 'uuid';

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
    // Separate company-level fields from settings-table fields
    const {
      require_order_approval,
      order_lead_time_days,
      default_delivery_window,
      default_delivery_address,
      default_cake_text,
      ...settingsFields
    } = input;

    const companyUpdates: Record<string, unknown> = {};
    if (require_order_approval !== undefined) companyUpdates.require_order_approval = require_order_approval;
    if (order_lead_time_days !== undefined) companyUpdates.order_lead_time_days = order_lead_time_days;
    if (default_delivery_window !== undefined) companyUpdates.default_delivery_window = default_delivery_window;
    if (default_delivery_address !== undefined) companyUpdates.default_delivery_address = default_delivery_address;
    if (default_cake_text !== undefined) companyUpdates.default_cake_text = default_cake_text;

    if (Object.keys(companyUpdates).length > 0) {
      await db
        .update(companies)
        .set({ ...companyUpdates, updated_at: new Date() })
        .where(eq(companies.id, companyId));
    }

    // Convert numeric fields to strings for Drizzle numeric columns
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { cancellation_fee_pct, ...remainingSettingsFields } = settingsFields;
    const settingsDbFields: typeof remainingSettingsFields & { cancellation_fee_pct?: string } = {
      ...remainingSettingsFields,
      ...(cancellation_fee_pct !== undefined && {
        cancellation_fee_pct: String(cancellation_fee_pct),
      }),
    };

    // Upsert settings row
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

  async getMembers(companyId: string) {
    const members = await db
      .select({
        id: companyMemberships.id,
        user_id: companyMemberships.user_id,
        company_id: companyMemberships.company_id,
        role: companyMemberships.role,
        is_active: companyMemberships.is_active,
        invitation_accepted_at: companyMemberships.invitation_accepted_at,
        created_at: companyMemberships.created_at,
        full_name: profiles.full_name,
        phone: profiles.phone,
      })
      .from(companyMemberships)
      .leftJoin(profiles, eq(companyMemberships.user_id, profiles.id))
      .where(eq(companyMemberships.company_id, companyId));

    return members;
  }

  async inviteMember(companyId: string, invitedBy: string, input: InviteUserInput) {
    // Check if email already has an account with this company
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const emailUser = existingUser?.users?.find((u) => u.email === input.email);

    if (emailUser) {
      const [existingMembership] = await db
        .select()
        .from(companyMemberships)
        .where(
          and(
            eq(companyMemberships.user_id, emailUser.id),
            eq(companyMemberships.company_id, companyId),
          ),
        )
        .limit(1);

      if (existingMembership) {
        throw new ConflictError('Bu kullanici zaten sirketinizin uyesidir.');
      }
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    if (emailUser) {
      // User exists — create membership directly (pending acceptance)
      const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, emailUser.id))
        .limit(1);

      if (!profile) throw new BadRequestError('Kullanici profili bulunamadi.');

      await db.insert(companyMemberships).values({
        user_id: emailUser.id,
        company_id: companyId,
        role: input.role as 'hr_manager' | 'finance' | 'viewer',
        invited_by: invitedBy,
        invitation_token: token,
        invitation_expires_at: expiresAt,
        is_active: false,
      });
    } else {
      // TODO: Send invitation email via Resend with signup link
      // For now, just log the invite token
      console.log(`Invite token for ${input.email}: ${token}`);
    }

    return {
      message: `Davet ${input.email} adresine gonderildi.`,
      invitation_token: token,
    };
  }
}

export const companyService = new CompanyService();
