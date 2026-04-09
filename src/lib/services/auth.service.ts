import { db } from "@/lib/db";
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  profiles,
  companies,
  companyMemberships,
  companySettings,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "@/lib/errors";
import { emailService } from "./email.service";
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/lib/shared";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
);

export class AuthService {
  /**
   * Register a new company + owner profile.
   */
  async register(input: RegisterInput) {
    // Check if company VKN is already taken (only when VKN is provided)
    if (input.vkn) {
      const [existingCompany] = await db
        .select({ id: companies.id })
        .from(companies)
        .where(eq(companies.vkn, input.vkn))
        .limit(1);

      if (existingCompany) {
        throw new ConflictError(
          "Bu vergi kimlik numarasina sahip bir sirket zaten kayitlidir.",
        );
      }
    }

    // Create Supabase auth user
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: input.email,
        password: input.password,
        // TODO: Remove this when we have a proper email verification flow
        email_confirm: process.env.NODE_ENV !== "development", // auto-confirm in dev
        user_metadata: {
          full_name: input.primary_contact_name,
          phone: input.phone,
        },
      });

    if (authError || !authData.user) {
      if (authError?.message?.includes("already registered")) {
        throw new ConflictError("Bu e-posta adresi zaten kullanilmaktadir.");
      }
      throw new BadRequestError(
        authError?.message ?? "Kullanici olusturulamadi.",
      );
    }

    const userId = authData.user.id;

    try {
      // Create company + profile + membership in a transaction-like sequence
      const [newCompany] = await db
        .insert(companies)
        .values({
          name: input.company_name,
          vkn: input.vkn || undefined,
          sector: input.sector || undefined,
          company_size_range: input.company_size_range || undefined,
          primary_contact_name: input.primary_contact_name,
          primary_contact_title: input.primary_contact_title || undefined,
          primary_contact_email: input.email,
          primary_contact_phone: input.phone,
          billing_address: input.billing_address || undefined,
          billing_district: (input.billing_district || undefined) as
            | typeof companies.billing_district._.data
            | undefined,
          status: "pending_verification",
          kvkk_accepted_at: new Date(),
        })
        .returning();

      await db.insert(profiles).values({
        id: userId,
        full_name: input.primary_contact_name,
        phone: input.phone,
        role: "company_owner",
      });

      await db.insert(companyMemberships).values({
        user_id: userId,
        company_id: newCompany.id,
        role: "company_owner",
      });

      // Create default company settings
      await db.insert(companySettings).values({
        company_id: newCompany.id,
      });

      // 4. Generate verification link and send email
      try {
        const { data: linkData, error: linkError } =
          await supabaseAdmin.auth.admin.generateLink({
            type: "signup",
            email: input.email,
            password: input.password,
          });

        if (linkError) {
          console.error(
            "Failed to generate verification link:",
            linkError.message,
          );
        } else if (linkData.properties?.hashed_token) {
          await emailService.sendVerificationEmail(
            input.email,
            input.primary_contact_name,
            linkData.properties.hashed_token,
          );
        }
      } catch (emailErr) {
        // Non-fatal error for the registration itself, but log it
        console.error("Registration email sending failed:", emailErr);
      }

      return {
        user_id: userId,
        company_id: newCompany.id,
        email: input.email,
        message: "Kayit basarili. Lutfen e-postanizi dogrulayin.",
      };
    } catch (err) {
      // Rollback: remove auth user if DB insert failed
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw err;
    }
  }

  /**
   * Login with email + password.
   */
  async login(input: LoginInput) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error || !data.session) {
      throw new UnauthorizedError("E-posta adresi veya sifre yanlis.");
    }

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, data.user.id))
      .limit(1);

    if (!profile) {
      throw new NotFoundError("User profile");
    }

    // Get company membership if applicable
    let company_id: string | null = null;
    if (profile.role !== "bakery_admin" && profile.role !== "platform_admin") {
      const [membership] = await db
        .select({ company_id: companyMemberships.company_id })
        .from(companyMemberships)
        .where(eq(companyMemberships.user_id, profile.id))
        .limit(1);
      company_id = membership?.company_id ?? null;
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: new Date(data.session.expires_at! * 1000).toISOString(),
      user: {
        id: profile.id,
        email: data.user.email,
        full_name: profile.full_name,
        role: profile.role,
        company_id,
        bakery_id: profile.bakery_id,
        onboarding_completed: profile.onboarding_completed,
      },
    };
  }

  /**
   * Logout (revoke session via admin API).
   * Uses the service role to revoke the session associated with the access token.
   */
  async logout(accessToken: string) {
    try {
      // Get the user from the token to find their ID, then revoke all sessions
      const { data } = await supabaseAdmin.auth.getUser(accessToken);
      if (data?.user) {
        await supabaseAdmin.auth.admin.signOut(data.user.id);
      }
    } catch (err) {
      // Non-fatal — token may already be expired or invalid
      console.warn(
        "Logout warning:",
        err instanceof Error ? err.message : String(err),
      );
    }
    return { message: "Basariyla cikis yapildi." };
  }

  /**
   * Send forgot-password email.
   */
  async forgotPassword(input: ForgotPasswordInput) {
    const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'}/reset-password`,
    });

    if (error) {
      // Don't reveal whether email exists
      console.warn("Forgot password error:", error.message);
    }

    return {
      message:
        "Sifre sifirlama baglantisi e-posta adresinize gonderildi (e-posta kayitliysa).",
    };
  }

  /**
   * Verify email using OTP token from Supabase confirmation email.
   */
  async verifyEmail(token: string) {
    const { error } = await supabaseAdmin.auth.verifyOtp({
      token_hash: token,
      type: "email",
    });

    if (error) {
      throw new BadRequestError(
        "Dogrulama basarisiz. Token gecersiz veya suresi dolmus olabilir.",
      );
    }

    return { message: "E-posta adresiniz basariyla dogrulandi." };
  }

  /**
   * Reset password using token from Supabase email link.
   */
  async resetPassword(input: ResetPasswordInput) {
    // The token here is the access_token from the reset link
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      input.token,
      {
        password: input.new_password,
      },
    );

    if (error) {
      throw new BadRequestError(
        "Sifre sifirlanamadi. Token gecersiz veya suresi dolmus olabilir.",
      );
    }

    return { message: "Sifreniz basariyla guncellendi." };
  }

  /**
   * Get current authenticated user's profile.
   */
  async getMe(userId: string) {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    if (!profile) {
      throw new NotFoundError("User profile");
    }

    let company_id: string | null = null;
    let membership_role = profile.role;

    if (profile.role !== "bakery_admin" && profile.role !== "platform_admin") {
      const [membership] = await db
        .select()
        .from(companyMemberships)
        .where(eq(companyMemberships.user_id, userId))
        .limit(1);
      if (membership) {
        company_id = membership.company_id;
        membership_role = membership.role;
      }
    }

    return {
      id: profile.id,
      full_name: profile.full_name,
      phone: profile.phone,
      role: membership_role,
      whatsapp_number: profile.whatsapp_number,
      whatsapp_opt_in: profile.whatsapp_opt_in,
      email_notifications_enabled: profile.email_notifications_enabled,
      whatsapp_notifications_enabled: profile.whatsapp_notifications_enabled,
      bakery_id: profile.bakery_id,
      company_id,
      onboarding_completed: profile.onboarding_completed,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };
  }
}

export const authService = new AuthService();
