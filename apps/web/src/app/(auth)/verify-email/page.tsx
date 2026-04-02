"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Doğrulama bağlantısı geçersiz.");
      return;
    }

    authApi
      .verifyEmail(token)
      .then(() => {
        setStatus("success");
        setTimeout(() => router.push("/dashboard"), 2500);
      })
      .catch((err) => {
        setStatus("error");
        setErrorMessage(err.message ?? "Doğrulama başarısız. Bağlantı süresi dolmuş olabilir.");
      });
  }, [token, router]);

  const handleResend = () => {
    if (resendCooldown > 0) return;
    // Start 60s cooldown
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
    // In a real implementation you'd call your resend endpoint here
  };

  /* ── Loading ── */
  if (status === "loading") {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="mx-auto w-20 h-20 rounded-full bg-[#F97316]/10 flex items-center justify-center">
          <Loader2 className="h-9 w-9 text-[#F97316] animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-[#1a1a2e]">Doğrulanıyor...</h2>
          <p className="text-gray-500">E-posta adresiniz doğrulanıyor, lütfen bekleyin.</p>
        </div>
      </div>
    );
  }

  /* ── Success ── */
  if (status === "success") {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-9 h-9 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-[#1a1a2e]">E-posta Doğrulandı! 🎉</h2>
          <p className="text-gray-500 max-w-xs mx-auto leading-relaxed">
            Hesabınız aktif edildi. Birkaç saniye içinde panele yönlendiriliyorsunuz...
          </p>
        </div>
        <Button
          asChild
          className="w-full h-12 bg-[#F97316] hover:bg-[#ea580c] text-white font-semibold rounded-xl"
        >
          <Link href="/dashboard">Panele Git</Link>
        </Button>
      </div>
    );
  }

  /* ── No-token / waiting state (shown before token redirect lands) ── */
  if (!token && status === "error" && errorMessage === "Doğrulama bağlantısı geçersiz.") {
    return (
      <div className="space-y-8">
        {/* Mail icon */}
        <div className="space-y-5">
          <div className="w-14 h-14 rounded-full bg-[#F97316]/10 flex items-center justify-center text-3xl select-none">
            ✉️
          </div>
          <div className="space-y-1.5">
            <h1 className="text-3xl font-extrabold text-[#1a1a2e] tracking-tight">
              E-postanızı Doğrulayın ✉️
            </h1>
            <p className="text-gray-500 text-base leading-relaxed">
              Kayıt sırasında girdiğiniz e-posta adresine bir doğrulama bağlantısı gönderdik.
              Gelen kutunuzu (ve spam klasörünü) kontrol edin.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 space-y-1">
          <p className="text-sm font-semibold text-[#1a1a2e]">E-posta gelmediyse:</p>
          <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
            <li>Spam / Önemsiz klasörünü kontrol edin</li>
            <li>E-posta adresinizin doğru olduğundan emin olun</li>
            <li>Birkaç dakika bekleyin</li>
          </ul>
        </div>

        {/* Resend button */}
        <Button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0}
          variant="outline"
          className="w-full h-12 rounded-xl border-gray-200 text-[#1a1a2e] font-semibold hover:bg-gray-50 disabled:opacity-60"
        >
          {resendCooldown > 0
            ? `Tekrar Gönder (${resendCooldown}s)`
            : "Doğrulama E-postasını Tekrar Gönder"}
        </Button>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-[#1a1a2e] transition-colors w-full py-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Giriş Sayfasına Dön
        </Link>
      </div>
    );
  }

  /* ── Error ── */
  return (
    <div className="text-center space-y-6 py-8">
      <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
        <svg className="w-9 h-9 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6M9 9l6 6" />
        </svg>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold text-[#1a1a2e]">Doğrulama Başarısız</h2>
        <p className="text-gray-500 max-w-xs mx-auto leading-relaxed">{errorMessage}</p>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          asChild
          className="w-full h-12 bg-[#F97316] hover:bg-[#ea580c] text-white font-semibold rounded-xl"
        >
          <Link href="/login">Giriş Yap</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="w-full h-12 rounded-xl border-gray-200 text-[#1a1a2e] font-semibold hover:bg-gray-50"
        >
          <Link href="/register">Yeniden Kayıt Ol</Link>
        </Button>
      </div>

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-[#1a1a2e] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
