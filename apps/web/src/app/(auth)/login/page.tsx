import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Giriş Yap | CakeDay",
  description: "Hesabınıza giriş yapın ve siparişlerinizi yönetin.",
};

export default function LoginPage() {
  return <LoginForm />;
}
