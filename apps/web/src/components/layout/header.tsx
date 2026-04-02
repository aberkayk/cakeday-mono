"use client";

import { Bell, ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { getInitials } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface HeaderProps {
  onMenuToggle?: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Genel Bakış",
  "/dashboard/employees": "Çalışanlar",
  "/dashboard/employees/import": "CSV ile Toplu Yükleme",
  "/dashboard/ordering-rules": "Sipariş Kuralları",
  "/dashboard/orders": "Siparişler",
  "/dashboard/orders/new": "Yeni Sipariş",
  "/dashboard/billing": "Faturalama",
  "/dashboard/settings": "Ayarlar",
};

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const displayName = user?.user_metadata?.full_name ?? user?.email ?? "Kullanıcı";

  const pageTitle =
    Object.entries(PAGE_TITLES)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([key]) => pathname === key || pathname.startsWith(key + "/"))?.[1] ?? "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-outline-variant/30 bg-surface-lowest px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-on-surface-variant hover:text-on-surface"
        onClick={onMenuToggle}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Menüyü aç</span>
      </Button>

      <h1 className="text-lg font-bold text-on-surface hidden lg:block font-headline">{pageTitle}</h1>

      <div className="flex-1" />

      {/* Notification bell */}
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
      >
        <Bell className="h-4.5 w-4.5" />
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-surface-lowest" />
        <span className="sr-only">Bildirimler</span>
      </Button>

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2.5 px-2.5 h-9 rounded-xl hover:bg-surface-container-low"
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary-fixed text-primary-dark font-semibold text-xs">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:block text-sm font-medium text-on-surface max-w-[140px] truncate">
              {displayName}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-on-surface-variant" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-lg border border-outline-variant/30">
          <DropdownMenuLabel className="text-xs text-on-surface-variant font-normal truncate px-3 py-2">
            {user?.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-outline-variant/30" />
          <DropdownMenuItem asChild className="rounded-lg mx-1 cursor-pointer">
            <a href="/dashboard/settings">Ayarlar</a>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-outline-variant/30" />
          <DropdownMenuItem
            className="text-red-500 focus:text-red-500 rounded-lg mx-1 cursor-pointer"
            onClick={() => logout()}
          >
            Çıkış Yap
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
