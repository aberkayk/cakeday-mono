"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Shield, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authApi } from "@/lib/api";

const schema = z.object({
  email: z.string().email("Geçerli e-posta girin."),
  password: z.string().min(1, "Şifre gerekli."),
});
type FormData = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const res = await authApi.login(data.email, data.password);
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", res.data.accessToken);
      }
      router.push("/dashboard");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Giriş başarısız.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-white text-lg font-bold">CakeDay</p>
            <p className="text-gray-400 text-sm">Admin Paneli</p>
          </div>
        </div>

        <Card className="bg-gray-900 border-gray-700 text-white">
          <CardHeader className="space-y-1">
            <CardTitle className="text-white text-xl">Admin Girişi</CardTitle>
            <CardDescription className="text-gray-400">
              Yalnızca platform yöneticileri erişebilir.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {serverError && (
                <div className="rounded-md bg-red-900/30 border border-red-800 px-4 py-3 text-sm text-red-400">
                  {serverError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@cakeday.com"
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  {...register("email")}
                />
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200">Şifre</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="bg-gray-800 border-gray-700 text-white"
                    {...register("password")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-8 w-8 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Giriş Yap
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
