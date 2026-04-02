import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ── Left Panel (dark) ── */}
      <div className="
        relative flex-shrink-0
        h-[100px] md:h-auto md:w-[420px] lg:w-[480px]
        bg-[#1a1a2e] flex flex-col
        overflow-hidden
      ">
        {/* Logo */}
        <div className="absolute top-0 left-0 right-0 flex items-center px-8 py-6 z-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="text-2xl">🎂</span>
            <span className="text-white font-bold text-xl tracking-tight">CakeDay</span>
          </Link>
        </div>

        {/* Decorative center — hidden on mobile */}
        <div className="hidden md:flex flex-1 flex-col items-center justify-center px-10 pb-8 pt-24">
          {/* Decorative blob behind the cake */}
          <div className="relative mb-8">
            <div className="w-48 h-48 rounded-full bg-white/5 flex items-center justify-center">
              <div className="w-36 h-36 rounded-full bg-[#F97316]/10 flex items-center justify-center">
                <span className="text-7xl select-none">🎂</span>
              </div>
            </div>
            {/* floating pill 1 */}
            <div className="absolute -top-3 -right-4 bg-white/10 rounded-full px-3 py-1.5 flex items-center gap-1.5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-white/80 text-xs font-medium">Otomatik Sipariş</span>
            </div>
            {/* floating pill 2 */}
            <div className="absolute -bottom-3 -left-6 bg-[#F97316]/20 rounded-full px-3 py-1.5 flex items-center gap-1.5 border border-[#F97316]/20">
              <span className="text-xs">🎉</span>
              <span className="text-white/80 text-xs font-medium">500+ Şirket</span>
            </div>
          </div>

          {/* Feature list */}
          <ul className="space-y-3 w-full max-w-xs mb-10">
            {[
              "Doğum günlerini hiç kaçırma",
              "Otomatik pasta siparişleri",
              "İstanbul'a kapıda teslimat",
              "Excel / CSV içe aktarma",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-white/70 text-sm">
                <div className="w-5 h-5 rounded-full bg-[#F97316]/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-[#F97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Tagline at bottom */}
        <div className="
          hidden md:block
          px-8 py-8 border-t border-white/10
        ">
          <p className="text-white/50 text-xs leading-relaxed">
            Doğum günü kutlamalarını otomatikleştirin
          </p>
          <p className="text-white/30 text-xs mt-1">
            İlk 30 gün ücretsiz · Kredi kartı gerekmez
          </p>
        </div>

        {/* Mobile: show tagline inline */}
        <div className="md:hidden absolute bottom-3 left-0 right-0 text-center">
          <p className="text-white/50 text-xs">Doğum günü kutlamalarını otomatikleştirin</p>
        </div>
      </div>

      {/* ── Right Panel (white, scrollable) ── */}
      <div className="flex-1 bg-white flex flex-col">
        <div className="flex-1 flex items-start md:items-center justify-center px-6 py-10 md:py-16 overflow-y-auto">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
        <footer className="py-4 text-center text-xs text-gray-400 border-t border-gray-100">
          © 2026 CakeDay. Tüm hakları saklıdır.
        </footer>
      </div>
    </div>
  );
}
