"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cake, Menu, X } from "lucide-react";

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
      <div className="bg-nav-dark rounded-xl px-3 py-4 flex items-center gap-8 shadow-lg w-full max-w-4xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 px-3 py-1.5">
          <Cake className="h-5 w-5 text-white" strokeWidth={2} />
          <span className="font-headline font-bold text-base text-white italic">
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
                    ? "bg-white/20 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Right CTA — desktop */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/login"
            className="text-sm font-medium text-white/80 hover:text-white transition-colors px-3 py-1.5"
          >
            Giriş Yap
          </Link>
          <Link
            href="/register"
            className="bg-tertiary-container text-on-tertiary-container text-sm font-bold px-5 py-2 rounded-full hover:brightness-110 transition-all"
          >
            Kutlamaya Başla
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-white/80 ml-auto"
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
        <div className="md:hidden mt-2 bg-nav-dark rounded-2xl px-4 py-3 space-y-1 w-full max-w-3xl shadow-lg">
          {navItems.map((item) => {
            const isActive = activeSection === item.href;
            return (
              <a
                key={item.label}
                href={item.href}
                className={`block text-sm font-medium py-2 px-3 rounded-lg ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            );
          })}
          <div className="pt-2 flex flex-col gap-2 border-t border-white/10 mt-2">
            <Link
              href="/login"
              className="block text-center text-sm font-medium text-white/80 py-2"
            >
              Giriş Yap
            </Link>
            <Link
              href="/register"
              className="block text-center bg-tertiary-container text-on-tertiary-container text-sm font-bold rounded-full py-2.5"
            >
              Kutlamaya Başla
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
