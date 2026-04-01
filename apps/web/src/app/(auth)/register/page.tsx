"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { SECTOR_OPTIONS, COMPANY_SIZE_LABELS, DISTRICT_LABELS } from "@/lib/utils";

const schema = z.object({
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
}).refine((d) => d.password === d.passwordConfirm, {
  path: ["passwordConfirm"],
  message: "Şifreler eşleşmiyor.",
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

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
        err instanceof Error ? err.message : "Kayıt işlemi başarısız. Lütfen tekrar deneyin."
      );
    }
  };

  if (success) {
    return (
      <Card className="shadow-lg">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="text-2xl font-bold">Kayıt Başarılı!</h2>
          <p className="text-muted-foreground">
            E-posta adresinize doğrulama bağlantısı gönderdik. Hesabınızı aktif etmek için e-postanızdaki bağlantıya tıklayın.
          </p>
          <Button asChild className="w-full">
            <Link href="/login">Giriş Sayfasına Git</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Şirketinizi Kaydedin</CardTitle>
        <CardDescription>
          CakeDay'e katılın, çalışan doğum günlerini otomatikleştirin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {serverError && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Şirket Bilgileri</h3>

            <div className="space-y-2">
              <Label htmlFor="companyName">Şirket Adı *</Label>
              <Input id="companyName" placeholder="Örnek A.Ş." {...register("companyName")} />
              {errors.companyName && <p className="text-xs text-destructive">{errors.companyName.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="vkn">Vergi Numarası *</Label>
                <Input id="vkn" placeholder="0000000000" maxLength={10} {...register("vkn")} />
                {errors.vkn && <p className="text-xs text-destructive">{errors.vkn.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>İlçe *</Label>
                <Select onValueChange={(v) => setValue("district", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DISTRICT_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.district && <p className="text-xs text-destructive">{errors.district.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Sektör *</Label>
                <Select onValueChange={(v) => setValue("sector", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTOR_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.sector && <p className="text-xs text-destructive">{errors.sector.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Çalışan Sayısı *</Label>
                <Select onValueChange={(v) => setValue("companySize", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(COMPANY_SIZE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.companySize && <p className="text-xs text-destructive">{errors.companySize.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingAddress">Fatura Adresi *</Label>
              <Input id="billingAddress" placeholder="Tam adres" {...register("billingAddress")} />
              {errors.billingAddress && <p className="text-xs text-destructive">{errors.billingAddress.message}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Yönetici Bilgileri</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="contactName">Ad Soyad *</Label>
                <Input id="contactName" placeholder="Ad Soyad" {...register("contactName")} />
                {errors.contactName && <p className="text-xs text-destructive">{errors.contactName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactTitle">Unvan</Label>
                <Input id="contactTitle" placeholder="İK Müdürü" {...register("contactTitle")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">İş E-postası *</Label>
              <Input id="email" type="email" placeholder="ad@sirket.com" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon *</Label>
              <Input id="phone" type="tel" placeholder="05XX XXX XX XX" {...register("phone")} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Şifre</h3>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="En az 8 karakter"
                  {...register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8 text-muted-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">Şifre Tekrar *</Label>
              <Input
                id="passwordConfirm"
                type={showPassword ? "text" : "password"}
                placeholder="Şifrenizi tekrar girin"
                {...register("passwordConfirm")}
              />
              {errors.passwordConfirm && <p className="text-xs text-destructive">{errors.passwordConfirm.message}</p>}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kayıt Ol
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Zaten hesabınız var mı?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Giriş Yapın
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
