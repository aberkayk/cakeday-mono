"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cake, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Nasıl Çalışır", href: "#how-it-works" },
  { label: "Özellikler", href: "#features" },
  { label: "Ücretlendirme", href: "#pricing" },
  { label: "SSS", href: "#faq" },
  // { label: "İletişim", href: "#contact" },
];

export function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const sectionIds = navItems.map((item) => item.href.replace("#", ""));

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry that is most visible
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          setActiveSection(`#${visible[0].target.id}`);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky bg-transparent top-0 z-50 flex flex-col items-center pt-3 px-4 ">
      <div className="bg-background-secondary/80 backdrop-blur-md rounded-xl px-3 py-4 flex items-center gap-8 shadow-ambient w-full max-w-4xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 px-3 py-1.5">
          <Cake className="h-5 w-5 text-primary" strokeWidth={2} />
          <span className="font-headline font-bold text-base text-foreground italic">
            CakeDay
          </span>
        </Link>

        {/* Center nav — desktop */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {navItems.map((item) => {
            const isActive = activeSection === item.href;
            return (
              <a
                key={item.label}
                href={item.href}
                className={`text-sm font-medium transition-all px-3 py-1.5 rounded-full ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Right CTA — desktop */}
        <div className="hidden md:flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/login">Giriş Yap</Link>
          </Button>
          <Button asChild variant="default">
            <Link href="/register">Kutlamaya Başla</Link>
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-foreground ml-auto"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menü"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden mt-2 bg-background-secondary rounded-2xl px-4 py-3 space-y-1 w-full max-w-3xl shadow-ambient">
          {navItems.map((item) => {
            const isActive = activeSection === item.href;
            return (
              <a
                key={item.label}
                href={item.href}
                className={`block text-sm font-medium py-2 px-3 rounded-lg ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            );
          })}
          <div className="pt-2 flex flex-col gap-2 border-t border-foreground/5 mt-2">
            <Link
              href="/login"
              className="block text-center text-sm font-medium text-muted-foreground py-2"
            >
              Giriş Yap
            </Link>
            <Button asChild variant="default" className="w-full font-bold">
              <Link href="/register">Kutlamaya Başla</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
