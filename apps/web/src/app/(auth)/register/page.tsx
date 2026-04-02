import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Kayıt Ol | CakeDay",
  description: "Şirketinizi kaydedin ve çalışanlarınızın doğum günlerini otomatikleştirin.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
