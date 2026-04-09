"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { authApi } from "@/lib/api";

export function useAuth() {
  const router = useRouter();
  const { user, session, isLoading, userRole, companyId, bakeryId, setSession, setLoading, clearAuth } =
    useAuthStore();

  // Create a stable supabase client reference for this hook instance
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setSession, setLoading, supabase]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      setSession(data.session);
      const role = data.session?.user?.user_metadata?.role;
      if (role === "bakery_admin") {
        router.push("/bakery");
      } else if (role === "platform_admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    },
    [setSession, router, supabase]
  );

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      companyName: string;
      contactName: string;
      phone: string;
      vkn?: string;
      sector?: string;
      companySize?: string;
      billingAddress?: string;
      district?: string;
      kvkkAccepted: boolean;
    }) => {
      const res = await authApi.register({
        email: data.email,
        password: data.password,
        company_name: data.companyName,
        primary_contact_name: data.contactName,
        phone: data.phone,
        vkn: data.vkn,
        sector: data.sector,
        company_size_range: data.companySize,
        billing_address: data.billingAddress,
        billing_district: data.district,
        kvkk_accepted: data.kvkkAccepted,
      });
      return res;
    },
    []
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    clearAuth();
    router.push("/login");
  }, [clearAuth, router, supabase]);

  const forgotPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(error.message);
  }, [supabase]);

  return {
    user,
    session,
    isLoading,
    userRole,
    companyId,
    bakeryId,
    isAuthenticated: !!session,
    login,
    register,
    logout,
    forgotPassword,
  };
}
