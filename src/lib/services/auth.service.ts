import { db } from "@/lib/db";
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  users,
  companies,
  contacts,
  addresses,
  companySettings,
  bakeries,
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
   * Register a new company + owner user.
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
          role: "company_owner",
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
      // Create user row
      await db.insert(users).values({
        id: userId,
        full_name: input.primary_contact_name,
        phone: input.phone,
        role: "company_owner",
      });

      // Create company owned by user
      const [newCompany] = await db
        .insert(companies)
        .values({
          user_id: userId,
          name: input.company_name,
          vkn: input.vkn || undefined,
          sector: input.sector || undefined,
          email: input.email,
          status: "pending_verification",
        })
        .returning();

      // Create primary contact
      await db.insert(contacts).values({
        company_id: newCompany.id,
        name: input.primary_contact_name,
        title: input.primary_contact_title || undefined,
        email: input.email,
        phone: input.phone,
      });

      // Create billing address if provided
      if (input.billing_address) {
        await db.insert(addresses).values({
          company_id: newCompany.id,
          address: input.billing_address,
          district: (input.billing_district || undefined) as
            | typeof addresses.district._.data
            | undefined,
        });
      }

      // Create default company settings
      await db.insert(companySettings).values({
        company_id: newCompany.id,
      });

      // Generate verification link and send email
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

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, data.user.id))
      .limit(1);

    if (!user) {
      throw new NotFoundError("User");
    }

    // Resolve company_id or bakery_id by role
    let company_id: string | null = null;
    let bakery_id: string | null = null;

    if (user.role === "bakery_admin") {
      const [bakery] = await db
        .select({ id: bakeries.id })
        .from(bakeries)
        .where(eq(bakeries.user_id, user.id))
        .limit(1);
      bakery_id = bakery?.id ?? null;
    } else if (user.role !== "platform_admin") {
      const [company] = await db
        .select({ id: companies.id })
        .from(companies)
        .where(eq(companies.user_id, user.id))
        .limit(1);
      company_id = company?.id ?? null;
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: new Date(data.session.expires_at! * 1000).toISOString(),
      user: {
        id: user.id,
        email: data.user.email,
        full_name: user.full_name,
        role: user.role,
        company_id,
        bakery_id,
        onboarding_completed: user.onboarding_completed,
      },
    };
  }

  /**
   * Logout (revoke session via admin API).
   */
  async logout(accessToken: string) {
    try {
      const { data } = await supabaseAdmin.auth.getUser(accessToken);
      if (data?.user) {
        await supabaseAdmin.auth.admin.signOut(data.user.id);
      }
    } catch (err) {
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
   * Get current authenticated user.
   */
  async getMe(userId: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundError("User");
    }

    let company_id: string | null = null;
    let bakery_id: string | null = null;

    if (user.role === "bakery_admin") {
      const [bakery] = await db
        .select({ id: bakeries.id })
        .from(bakeries)
        .where(eq(bakeries.user_id, userId))
        .limit(1);
      bakery_id = bakery?.id ?? null;
    } else if (user.role !== "platform_admin") {
      const [company] = await db
        .select({ id: companies.id })
        .from(companies)
        .where(eq(companies.user_id, userId))
        .limit(1);
      company_id = company?.id ?? null;
    }

    return {
      id: user.id,
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
      bakery_id,
      company_id,
      onboarding_completed: user.onboarding_completed,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}

export const authService = new AuthService();
