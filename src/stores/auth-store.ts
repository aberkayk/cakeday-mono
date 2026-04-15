import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  userRole: string | null;
  companyId: string | null;
  bakeryId: string | null;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: true,
      userRole: null,
      companyId: null,
      bakeryId: null,

      setUser: (user) => {
        const meta = user?.user_metadata ?? {};
        set({
          user,
          userRole: meta.role ?? null,
          companyId: meta.company_id ?? null,
          bakeryId: meta.bakery_id ?? null,
        });
      },

      setSession: (session) => {
        if (session) {
          const meta = session.user?.user_metadata ?? {};
          if (typeof window !== "undefined" && session.access_token) {
            localStorage.setItem("access_token", session.access_token);
          }
          set({
            session,
            user: session.user,
            userRole: meta.role ?? null,
            companyId: meta.company_id ?? null,
            bakeryId: meta.bakery_id ?? null,
          });
        } else {
          if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
          }
          set({ session: null });
        }
      },

      setLoading: (isLoading) => set({ isLoading }),

      clearAuth: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
        }
        set({
          user: null,
          session: null,
          isLoading: false,
          userRole: null,
          companyId: null,
          bakeryId: null,
        });
      },
    }),
    {
      name: "cakeday_auth_store",
      partialize: (state) => ({
        userRole: state.userRole,
        companyId: state.companyId,
        bakeryId: state.bakeryId,
      }),
    }
  )
);
