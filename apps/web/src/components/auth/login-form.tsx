"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

const schema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin."),
  password: z.string().min(1, "Şifre gerekli."),
  rememberMe: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      await login(data.email, data.password);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin."
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div className="space-y-1.5">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight font-headline">
          Hoş Geldiniz 👋
        </h1>
        <p className="text-muted text-base">Hesabınıza giriş yapın</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Server error */}
        {serverError && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2.5">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {serverError}
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            E-posta
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted h-[18px] w-[18px]" />
            <Input
              id="email"
              type="email"
              placeholder="ornek@sirket.com"
              autoComplete="email"
              className="pl-10 h-12 rounded-xl border-border-soft bg-background-secondary focus:bg-background text-foreground placeholder:text-muted focus-visible:ring-primary focus-visible:ring-offset-0"
              {...register("email")}
            />
          </div>
          {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            Şifre
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted h-[18px] w-[18px]" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              className="pl-10 pr-11 h-12 rounded-xl border-border-soft bg-background-secondary focus:bg-background text-foreground placeholder:text-muted focus-visible:ring-primary focus-visible:ring-offset-0"
              {...register("password")}
            />
            <button
              type="button"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
            >
              {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
        </div>

        {/* Remember me + forgot password row */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-border-soft accent-primary cursor-pointer"
              {...register("rememberMe")}
            />
            <span className="text-sm text-muted group-hover:text-foreground transition-colors">
              Beni hatırla
            </span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:text-primary font-medium transition-colors"
          >
            Şifremi Unuttum
          </Link>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          size="lg"
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Giriş yapılıyor...
            </>
          ) : (
            "Giriş Yap"
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-soft" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-sm text-muted">veya</span>
        </div>
      </div>

      {/* Register link */}
      <p className="text-center text-sm text-muted">
        Hesabınız yok mu?{" "}
        <Link
          href="/register"
          className="text-primary hover:text-primary font-semibold transition-colors"
        >
          Ücretsiz Kayıt Olun
        </Link>
      </p>
    </div>
  );
}
