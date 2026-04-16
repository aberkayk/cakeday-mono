"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Store,
  ShoppingBag,
  Cake,
  Tag,
  Settings,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/admin/companies", label: "Şirketler", icon: Building2 },
  { href: "/admin/suppliers", label: "Tedarikçiler", icon: Store },
  { href: "/admin/orders", label: "Siparişler", icon: ShoppingBag },
  { href: "/admin/catalogue", label: "Pasta Kataloğu", icon: Cake },
  { href: "/admin/pricing-requests", label: "Fiyat Talepleri", icon: Tag },
  { href: "/admin/settings", label: "Sistem Ayarları", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-gray-900 text-white">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-700">
        <Shield className="h-7 w-7 text-primary" />
        <div>
          <span className="text-lg font-bold">CakeDay</span>
          <p className="text-xs text-gray-400">Admin Paneli</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/20 text-primary"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-700">
        <p className="px-3 text-xs text-gray-500">© 2026 CakeDay Admin</p>
      </div>
    </aside>
  );
}
