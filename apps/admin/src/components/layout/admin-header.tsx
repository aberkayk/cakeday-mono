"use client";

import { Menu, ChevronDown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";

interface AdminHeaderProps {
  onMenuToggle?: () => void;
  adminEmail?: string;
}

export function AdminHeader({ onMenuToggle, adminEmail = "admin@cakeday.com" }: AdminHeaderProps) {
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-white px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuToggle}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-2">
        <span className="hidden lg:block text-sm font-medium text-muted-foreground">
          CakeDay Admin
        </span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold text-sm flex items-center justify-center">
            <Shield className="h-4 w-4" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium">Platform Admin</p>
            <p className="text-xs text-muted-foreground">{adminEmail}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive hover:text-destructive">
          Çıkış
        </Button>
      </div>
    </header>
  );
}
