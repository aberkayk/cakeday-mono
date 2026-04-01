import Link from "next/link";
import { Cake } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <nav className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Cake className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">CakeDay</span>
        </Link>
      </nav>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>

      <footer className="py-4 text-center text-xs text-muted-foreground">
        © 2026 CakeDay. Tüm hakları saklıdır.
      </footer>
    </div>
  );
}
