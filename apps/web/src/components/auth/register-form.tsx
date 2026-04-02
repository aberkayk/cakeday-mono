"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Building2,
  User,
  Mail,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { SECTOR_OPTIONS, COMPANY_SIZE_LABELS, DISTRICT_LABELS } from "@/lib/utils";

const schema = z
  .object({
    companyName: z.string().min(2, "Şirket adı en az 2 karakter olmalı."),
    vkn: z
      .string()
      .length(10, "Vergi numarası 10 haneli olmalı.")
      .regex(/^\d+$/, "Vergi numarası sadece rakam içermeli."),
    sector: z.string().min(1, "Sektör seçin."),
    companySize: z.string().min(1, "Çalışan sayısı aralığı seçin."),
    contactName: z.string().min(2, "Ad Soyad en az 2 karakter olmalı."),
    contactTitle: z.string().optional(),
    email: z.string().email("Geçerli bir e-posta adresi girin."),
    phone: z
      .string()
      .regex(/^\+90[5][0-9]{9}$/, "Geçerli bir Türk cep telefonu girin. (+905XXXXXXXXX)"),
    billingAddress: z.string().min(5, "Fatura adresi en az 5 karakter olmalı."),
    district: z.string().min(1, "İlçe seçin."),
    password: z
      .string()
      .min(8, "Şifre en az 8 karakter olmalı.")
      .regex(/[A-Z]/, "En az bir büyük harf içermeli.")
      .regex(/[0-9]/, "En az bir rakam içermeli."),
    passwordConfirm: z.string(),
    terms: z.literal(true, { errorMap: () => ({ message: "Kullanım koşullarını kabul etmelisiniz." }) }),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Şifreler eşleşmiyor.",
  });
type FormData = z.infer<typeof schema>;

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: "Çok zayıf", color: "bg-red-500" };
  if (score === 2) return { score, label: "Zayıf", color: "bg-orange-400" };
  if (score === 3) return { score, label: "Orta", color: "bg-yellow-400" };
  if (score === 4) return { score, label: "Güçlü", color: "bg-green-400" };
  return { score, label: "Çok güçlü", color: "bg-green-600" };
}

const COMPANY_SIZE_OPTIONS = [
  { value: "1-10", label: "1–10" },
  { value: "11-50", label: "11–50" },
  { value: "51-200", label: "51–200" },
  { value: "200+", label: "200+" },
];

/* ─── Input wrapper with icon ─── */
function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
      {children}
    </div>
  );
}

/* ─── Reusable input classes ─── */
const inputCls =
  "h-11 rounded-xl border-border-soft bg-background-secondary focus:bg-background text-foreground placeholder:text-muted focus-visible:ring-primary focus-visible:ring-offset-0";
const inputWithIconCls = `pl-10 ${inputCls}`;

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showOptional, setShowOptional] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const watchedPassword = watch("password") ?? "";
  const strength = getPasswordStrength(watchedPassword);

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        companyName: data.companyName,
        contactName: data.contactName,
        phone: data.phone,
        vkn: data.vkn,
        sector: data.sector,
        companySize: data.companySize,
        billingAddress: data.billingAddress,
        district: data.district,
      });
      setSuccess(true);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Kayııt işlemi başarısız. Lütfen tekrar deneyin."
      );
    }
  };

  /* ─── Success state ─── */
  if (success) {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-foreground font-headline">Kayıt Başarılı! 🎉</h2>
          <p className="text-muted max-w-xs mx-auto leading-relaxed">
            E-posta adresinize doğrulama bağlantısı gönderdik. Hesabınızı aktif etmek için e-postanızdaki bağlantıya tıklayın.
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="w-full"
        >
          <Link href="/login">Giriş Sayfasına Git</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Heading */}
      <div className="space-y-1.5">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight font-headline">
          Şirketinizi Kaydedin 🎉
        </h1>
        <p className="text-muted text-base">1 dakikada başlayın</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Server error */}
        {serverError && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2.5">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {serverError}
          </div>
        )}

        {/* ── Section: Şirket Adı ── */}
        <div className="space-y-1.5">
          <Label htmlFor="companyName" className="text-sm font-medium text-foreground">
            Şirket Adı <span className="text-primary">*</span>
          </Label>
          <div className="relative">
            <FieldIcon><Building2 className="h-[18px] w-[18px]" /></FieldIcon>
            <Input
              id="companyName"
              placeholder="Örnek A.Ş."
              className={inputWithIconCls}
              {...register("companyName")}
            />
          </div>
          {errors.companyName && <p className="text-xs text-red-600">{errors.companyName.message}</p>}
        </div>

        {/* ── Section: Yetkili ── */}
        <div className="space-y-1.5">
          <Label htmlFor="contactName" className="text-sm font-medium text-foreground">
            Yetkili Ad Soyad <span className="text-primary">*</span>
          </Label>
          <div className="relative">
            <FieldIcon><User className="h-[18px] w-[18px]" /></FieldIcon>
            <Input
              id="contactName"
              placeholder="Ad Soyad"
              className={inputWithIconCls}
              {...register("contactName")}
            />
          </div>
          {errors.contactName && <p className="text-xs text-red-600">{errors.contactName.message}</p>}
        </div>

        {/* ── Section: Email ── */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            İş E-postası <span className="text-primary">*</span>
          </Label>
          <div className="relative">
            <FieldIcon><Mail className="h-[18px] w-[18px]" /></FieldIcon>
            <Input
              id="email"
              type="email"
              placeholder="ad@sirket.com"
              autoComplete="email"
              className={inputWithIconCls}
              {...register("email")}
            />
          </div>
          {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
        </div>

        {/* ── Section: Phone ── */}
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-sm font-medium text-foreground">
            Telefon <span className="text-primary">*</span>
          </Label>
          <div className="flex">
            <div className="flex items-center px-3.5 h-11 rounded-l-xl border border-r-0 border-border-soft bg-background-secondary text-sm text-muted font-medium select-none flex-shrink-0">
              +90
            </div>
            <Input
              id="phone"
              type="tel"
              placeholder="5XX XXX XX XX"
              className="h-11 rounded-l-none rounded-r-xl border-border-soft bg-background-secondary focus:bg-background text-foreground placeholder:text-muted focus-visible:ring-primary focus-visible:ring-offset-0 flex-1"
              {...register("phone")}
            />
          </div>
          {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
        </div>

        {/* ── Section: Password ── */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            Şifre <span className="text-primary">*</span>
          </Label>
          <div className="relative">
            <FieldIcon><Lock className="h-[18px] w-[18px]" /></FieldIcon>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="En az 8 karakter"
              className={`${inputWithIconCls} pr-11`}
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
          {/* Strength meter */}
          {watchedPassword.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i <= strength.score ? strength.color : "bg-background-secondary"
                    }`}
                  />
                ))}
              </div>
              {strength.label && (
                <p className={`text-xs font-medium ${
                  strength.score <= 2 ? "text-red-500" :
                  strength.score === 3 ? "text-yellow-600" : "text-green-600"
                }`}>
                  {strength.label}
                </p>
              )}
            </div>
          )}
          {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
        </div>

        {/* ── Section: Password Confirm ── */}
        <div className="space-y-1.5">
          <Label htmlFor="passwordConfirm" className="text-sm font-medium text-foreground">
            Şifre Tekrar <span className="text-primary">*</span>
          </Label>
          <div className="relative">
            <FieldIcon><Lock className="h-[18px] w-[18px]" /></FieldIcon>
            <Input
              id="passwordConfirm"
              type={showPassword ? "text" : "password"}
              placeholder="Şifrenizi tekrar girin"
              className={inputWithIconCls}
              {...register("passwordConfirm")}
            />
          </div>
          {errors.passwordConfirm && <p className="text-xs text-red-600">{errors.passwordConfirm.message}</p>}
        </div>

        {/* ── Collapsible: Ek Bilgiler ── */}
        <div className="rounded-xl border border-border-soft overflow-hidden">
          <button
            type="button"
            onClick={() => setShowOptional((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3.5 bg-background-secondary hover:bg-background-secondary transition-colors text-left"
          >
            <span className="text-sm font-semibold text-foreground">
              Ek Bilgiler{" "}
              <span className="text-muted font-normal">(Opsiyonel)</span>
            </span>
            {showOptional ? (
              <ChevronUp className="h-4 w-4 text-muted" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted" />
            )}
          </button>

          {showOptional && (
            <div className="px-4 pb-4 pt-3 space-y-4 border-t border-border-soft bg-background">
              {/* VKN */}
              <div className="space-y-1.5">
                <Label htmlFor="vkn" className="text-sm font-medium text-foreground">
                  Vergi Kimlik No (VKN)
                </Label>
                <Input
                  id="vkn"
                  placeholder="0000000000"
                  maxLength={10}
                  className={inputCls}
                  {...register("vkn")}
                />
                {errors.vkn && <p className="text-xs text-red-600">{errors.vkn.message}</p>}
              </div>

              {/* Fatura Adresi */}
              <div className="space-y-1.5">
                <Label htmlFor="billingAddress" className="text-sm font-medium text-foreground">
                  Fatura Adresi
                </Label>
                <Input
                  id="billingAddress"
                  placeholder="Tam adres"
                  className={inputCls}
                  {...register("billingAddress")}
                />
                {errors.billingAddress && <p className="text-xs text-red-600">{errors.billingAddress.message}</p>}
              </div>

              {/* Sektör + İlçe */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-foreground">Sektör</Label>
                  <Select onValueChange={(v) => setValue("sector", v)}>
                    <SelectTrigger className={`${inputCls} px-3`}>
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTOR_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.sector && <p className="text-xs text-red-600">{errors.sector.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-foreground">İlçe</Label>
                  <Select onValueChange={(v) => setValue("district", v)}>
                    <SelectTrigger className={`${inputCls} px-3`}>
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DISTRICT_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.district && <p className="text-xs text-red-600">{errors.district.message}</p>}
                </div>
              </div>

              {/* Şirket Büyüklüğü — radio pills */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Şirket Büyüklüğü</Label>
                <div className="flex gap-2 flex-wrap">
                  {COMPANY_SIZE_OPTIONS.map((opt) => (
                    <label key={opt.value} className="cursor-pointer">
                      <input
                        type="radio"
                        value={opt.value}
                        className="sr-only peer"
                        {...register("companySize")}
                      />
                      <span className="
                        block px-4 py-1.5 rounded-full text-sm font-medium border border-border-soft
                        bg-background-secondary text-muted
                        peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary
                        hover:border-primary/40 transition-all cursor-pointer
                      ">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.companySize && <p className="text-xs text-red-600">{errors.companySize.message}</p>}
              </div>

              {/* Unvan */}
              <div className="space-y-1.5">
                <Label htmlFor="contactTitle" className="text-sm font-medium text-foreground">
                  Unvan
                </Label>
                <Input
                  id="contactTitle"
                  placeholder="İK Müdürü"
                  className={inputCls}
                  {...register("contactTitle")}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Terms ── */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            className="w-4 h-4 mt-0.5 rounded border-border-soft accent-primary cursor-pointer flex-shrink-0"
            {...register("terms")}
          />
          <span className="text-sm text-muted leading-relaxed group-hover:text-foreground transition-colors">
            <Link href="/terms" className="text-primary hover:text-primary font-medium underline">
              Kullanım koşullarını
            </Link>{" "}
            kabul ediyorum
          </span>
        </label>
        {errors.terms && <p className="text-xs text-red-600 -mt-4">{errors.terms.message}</p>}

        {/* ── Submit ── */}
        <Button
          type="submit"
          disabled={isSubmitting}
          size="lg"
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            "Kayıt Ol"
          )}
        </Button>

        <p className="text-center text-sm text-muted">
          Zaten hesabınız var mı?{" "}
          <Link
            href="/login"
            className="text-primary hover:text-primary font-semibold transition-colors"
          >
            Giriş Yapın
          </Link>
        </p>
      </form>
    </div>
  );
}
