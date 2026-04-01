"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authApi } from "@/lib/api";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

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
        setTimeout(() => router.push("/dashboard"), 2000);
      })
      .catch((err) => {
        setStatus("error");
        setErrorMessage(err.message ?? "Doğrulama başarısız. Bağlantı süresi dolmuş olabilir.");
      });
  }, [token, router]);

  return (
    <Card className="shadow-lg">
      <CardContent className="pt-10 pb-10 text-center space-y-4">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-16 w-16 text-primary animate-spin" />
            <h2 className="text-2xl font-bold">Doğrulanıyor...</h2>
            <p className="text-muted-foreground">E-posta adresiniz doğrulanıyor, lütfen bekleyin.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-bold">E-posta Doğrulandı!</h2>
            <p className="text-muted-foreground">
              Hesabınız aktif edildi. Panele yönlendiriliyorsunuz...
            </p>
            <Button asChild>
              <Link href="/dashboard">Panele Git</Link>
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="mx-auto h-16 w-16 text-destructive" />
            <h2 className="text-2xl font-bold">Doğrulama Başarısız</h2>
            <p className="text-muted-foreground">{errorMessage}</p>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/login">Giriş Yap</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/register">Yeniden Kayıt Ol</Link>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
