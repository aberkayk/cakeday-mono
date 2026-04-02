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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-100 bg-white px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-gray-500 hover:text-gray-700"
        onClick={onMenuToggle}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Menüyü aç</span>
      </Button>

      <h1 className="text-lg font-bold text-dark-900 hidden lg:block">{pageTitle}</h1>

      <div className="flex-1" />

      {/* Notification bell */}
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-50"
      >
        <Bell className="h-4.5 w-4.5" />
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-coral-500 ring-2 ring-white" />
        <span className="sr-only">Bildirimler</span>
      </Button>

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2.5 px-2.5 h-9 rounded-xl hover:bg-gray-50"
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-coral-100 text-coral-700 font-semibold text-xs">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:block text-sm font-medium text-dark-900 max-w-[140px] truncate">
              {displayName}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-lg border border-gray-100">
          <DropdownMenuLabel className="text-xs text-gray-400 font-normal truncate px-3 py-2">
            {user?.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-100" />
          <DropdownMenuItem asChild className="rounded-lg mx-1 cursor-pointer">
            <a href="/dashboard/settings">Ayarlar</a>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-gray-100" />
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
