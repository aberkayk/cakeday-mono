"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { login as loginAction, logout as logoutAction, register as registerAction, forgotPassword as forgotPasswordAction } from "@/actions/auth";

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
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      const result = await loginAction(formData);
      if (result && "error" in result) {
        throw new Error(result.error);
      }
      // loginAction redirects on success, so no need to push router
    },
    []
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
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("company_name", data.companyName);
      formData.append("primary_contact_name", data.contactName);
      formData.append("phone", data.phone);
      if (data.vkn) formData.append("vkn", data.vkn);
      if (data.sector) formData.append("sector", data.sector);
      if (data.companySize) formData.append("company_size_range", data.companySize);
      if (data.billingAddress) formData.append("billing_address", data.billingAddress);
      if (data.district) formData.append("billing_district", data.district);
      formData.append("kvkk_accepted", String(data.kvkkAccepted));
      return registerAction(formData);
    },
    []
  );

  const logout = useCallback(async () => {
    clearAuth();
    await logoutAction();
  }, [clearAuth]);

  const forgotPassword = useCallback(async (email: string) => {
    const formData = new FormData();
    formData.append("email", email);
    await forgotPasswordAction(formData);
  }, []);

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
