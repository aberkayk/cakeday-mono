"use client";

import { useState } from "react";
import { SupplierSidebar } from "@/components/layout/supplier-sidebar";
import { Header } from "@/components/layout/header";
import { X, Menu, Cake } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ShoppingBag, Tag, Settings } from "lucide-react";

const navItems = [
  { href: "/supplier", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/supplier/orders", label: "Siparişler", icon: ShoppingBag },
  { href: "/supplier/pricing", label: "Fiyatlandırma", icon: Tag },
  { href: "/supplier/settings", label: "Ayarlar", icon: Settings },
];

function SupplierMobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 flex flex-col w-72 bg-background shadow-xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-soft">
          <div className="flex items-center gap-2">
            <Cake className="h-7 w-7 text-primary" />
            <span className="text-lg font-bold font-headline text-foreground">CakeDay</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/supplier" ? pathname === "/supplier" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={onClose}
                className={cn("flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive ? "bg-primary/20 text-primary" : "text-muted hover:bg-background-secondary hover:text-foreground"
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

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background-secondary">
      <div className="hidden lg:flex">
        <SupplierSidebar />
      </div>
      <SupplierMobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex flex-1 flex-col min-w-0">
        <Header onMenuToggle={() => setMobileNavOpen(true)} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
