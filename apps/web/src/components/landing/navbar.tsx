"use client";

import { useState } from "react";
import Link from "next/link";
import { Cake, Menu, X } from "lucide-react";

export function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 flex flex-col items-center pt-3 px-4">
      <div className="bg-[#3E2723] rounded-xl px-3 py-4 flex items-center gap-8  shadow-lg">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 px-3 py-1.5">
          <Cake className="h-5 w-5 text-white" strokeWidth={2} />
          <span className="font-headline font-bold text-base text-white italic">
            CakeDay
          </span>
        </Link>

        {/* Center nav — desktop */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {[
            "Nasıl Çalışır",
            "Özellikler",
            "Ücretlendirme",
            "SSS",
            "İletişim",
          ].map((label) => {
            const href = {
              "Nasıl Çalışır": "#how-it-works",
              Özellikler: "#features",
              Ücretlendirme: "#pricing",
              SSS: "#faq",
              İletişim: "#contact",
            }[label]!;
            return (
              <a
                key={label}
                href={href}
                className="text-sm font-medium text-white/80 hover:text-white transition-colors px-3 py-1.5 rounded-full hover:bg-white/10"
              >
                {label}
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
        <div className="md:hidden mt-2 bg-[#3E2723] rounded-2xl px-4 py-3 space-y-1 w-full max-w-3xl shadow-lg">
          {[
            "Nasıl Çalışır",
            "Özellikler",
            "Ücretlendirme",
            "SSS",
            "İletişim",
          ].map((label) => {
            const href = {
              "Nasıl Çalışır": "#how-it-works",
              Özellikler: "#features",
              Ücretlendirme: "#pricing",
              SSS: "#faq",
              İletişim: "#contact",
            }[label]!;
            return (
              <a
                key={label}
                href={href}
                className="block text-sm font-medium text-white/80 hover:text-white py-2 px-3 rounded-lg hover:bg-white/10"
                onClick={() => setMobileOpen(false)}
              >
                {label}
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
