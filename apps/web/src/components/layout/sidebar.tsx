"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  ListChecks,
  CreditCard,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { href: "/dashboard", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/dashboard/employees", label: "Çalışanlar", icon: Users },
  { href: "/dashboard/ordering-rules", label: "Sipariş Kuralları", icon: ListChecks },
  { href: "/dashboard/orders", label: "Siparişler", icon: ShoppingBag },
  { href: "/dashboard/billing", label: "Faturalama", icon: CreditCard },
  { href: "/dashboard/settings", label: "Ayarlar", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name ?? user?.email ?? "Kullanıcı";
  const companyName = user?.user_metadata?.company_name ?? "Şirketiniz";

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-coral-500 text-white shadow-sm">
          <span className="text-lg leading-none">🎂</span>
        </div>
        <span className="text-xl font-bold text-dark-900 tracking-tight">CakeDay</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-coral-50 text-coral-600 border-l-[3px] border-coral-500 pl-[9px]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-coral-500" : "text-gray-400"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-4 py-5 border-t border-gray-100 space-y-4">
        {/* Plan badge + upgrade */}
        <div className="bg-coral-50 rounded-xl px-4 py-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-dark-900">{companyName}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-coral-100 text-coral-700 px-2 py-0.5 rounded-full">
              Başlangıç
            </span>
          </div>
          <Link
            href="/dashboard/billing"
            className="flex items-center gap-1.5 text-xs font-medium text-coral-600 hover:text-coral-700 transition-colors"
          >
            <Zap className="h-3 w-3" />
            Pro&apos;ya Yükselt
          </Link>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 px-1">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-dark-100 text-dark-700 text-xs font-semibold">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-dark-900 truncate">{displayName}</p>
            <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
