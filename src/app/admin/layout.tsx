"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";
import { X, Shield, LayoutDashboard, Building2, Store, ShoppingBag, Cake, Tag, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/admin/companies", label: "Şirketler", icon: Building2 },
  { href: "/admin/bakeries", label: "Pastaneler", icon: Store },
  { href: "/admin/orders", label: "Siparişler", icon: ShoppingBag },
  { href: "/admin/catalogue", label: "Pasta Kataloğu", icon: Cake },
  { href: "/admin/pricing-requests", label: "Fiyat Talepleri", icon: Tag },
  { href: "/admin/settings", label: "Sistem Ayarları", icon: Settings },
];

function MobileAdminNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 flex flex-col w-72 bg-gray-900 text-white shadow-xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            <span className="text-lg font-bold">Admin</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-gray-800">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={onClose}
                className={cn("flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive ? "bg-primary/20 text-primary" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}>
                <Icon className="h-4 w-4 shrink-0" />{item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/20">
      <div className="hidden lg:flex">
        <AdminSidebar />
      </div>
      <MobileAdminNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex flex-1 flex-col min-w-0">
        <AdminHeader onMenuToggle={() => setMobileNavOpen(true)} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
