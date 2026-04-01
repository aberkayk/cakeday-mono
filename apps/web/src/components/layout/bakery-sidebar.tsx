"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Tag, Settings, Cake } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/bakery", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/bakery/orders", label: "Siparişler", icon: ShoppingBag },
  { href: "/bakery/pricing", label: "Fiyatlandırma", icon: Tag },
  { href: "/bakery/settings", label: "Ayarlar", icon: Settings },
];

export function BakerySidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-white border-r border-border">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <Cake className="h-7 w-7 text-primary" />
        <div>
          <span className="text-lg font-bold text-foreground">CakeDay</span>
          <p className="text-xs text-muted-foreground">Pastane Portalı</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/bakery"
              ? pathname === "/bakery"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <p className="px-3 text-xs text-muted-foreground">© 2026 CakeDay</p>
      </div>
    </aside>
  );
}
