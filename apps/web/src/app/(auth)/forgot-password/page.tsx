"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

const schema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin."),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      await forgotPassword(data.email);
      setSent(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Bir hata oluştu.");
    }
  };

  /* ── Success state ── */
  if (sent) {
    return (
      <div className="text-center space-y-6 py-4">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-9 h-9 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-foreground font-headline">E-posta Gönderildi</h2>
          <p className="text-muted max-w-xs mx-auto leading-relaxed">
            Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Gelen kutunuzu kontrol edin.
          </p>
        </div>

        <Button
          asChild
          className="w-full h-12 gradient-primary text-white font-semibold rounded-xl shadow-primary"
        >
          <Link href="/login">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Giriş Sayfasına Dön
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Lock icon in primary circle */}
      <div className="space-y-5">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <svg
            className="w-7 h-7 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight font-headline">
            Şifrenizi mi Unuttunuz?
          </h1>
          <p className="text-muted text-base leading-relaxed">
            E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.
          </p>
        </div>
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

        {/* Email field */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            E-posta
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted h-[18px] w-[18px]" />
            <Input
              id="email"
              type="email"
              placeholder="ornek@sirket.com"
              autoComplete="email"
              className="pl-10 h-12 rounded-xl border-border-soft bg-background-secondary focus:bg-background text-foreground placeholder:text-muted focus-visible:ring-primary focus-visible:ring-offset-0"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 gradient-primary text-white font-semibold rounded-xl text-base shadow-primary transition-all hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gönderiliyor...
            </>
          ) : (
            "Sıfırlama Bağlantısı Gönder"
          )}
        </Button>

        {/* Back link */}
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-muted hover:text-foreground transition-colors w-full py-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Giriş Sayfasına Dön
        </Link>
      </form>
    </div>
  );
}
