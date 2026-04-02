import Link from "next/link";
import { Cake } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-inverse-surface text-inverse-on-surface/70 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <Cake className="h-6 w-6 text-inverse-primary" />
              <span className="font-headline font-bold text-lg text-inverse-on-surface">
                CakeDay
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-inverse-on-surface/50">
              B2B doğum günü pasta teslimat platformu. Çalışan mutluluğunu
              otomatikleştirin.
            </p>
          </div>

          {/* Ürün */}
          <div>
            <p className="text-sm font-semibold text-inverse-on-surface mb-4">
              Ürün
            </p>
            <ul className="space-y-2 text-sm">
              {["Özellikler", "Ücretlendirme", "Nasıl Çalışır", "Kaydol"].map(
                (item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="hover:text-inverse-on-surface transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Şirket */}
          <div>
            <p className="text-sm font-semibold text-inverse-on-surface mb-4">
              Şirket
            </p>
            <ul className="space-y-2 text-sm">
              {["Hakkımızda", "Blog", "Kariyer", "İletişim"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="hover:text-inverse-on-surface transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Destek */}
          <div>
            <p className="text-sm font-semibold text-inverse-on-surface mb-4">
              Destek
            </p>
            <ul className="space-y-2 text-sm">
              {[
                "Gizlilik Politikası",
                "Kullanım Şartları",
                "KVKK",
                "Çerez Politikası",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="hover:text-inverse-on-surface transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-inverse-on-surface/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-inverse-on-surface/40">
          <p>© 2026 CakeDay · İstanbul&apos;da yapıldı</p>
          <div className="flex gap-6">
            <a
              href="#"
              className="hover:text-inverse-on-surface/70 transition-colors"
            >
              Gizlilik
            </a>
            <a
              href="#"
              className="hover:text-inverse-on-surface/70 transition-colors"
            >
              Şartlar
            </a>
            <a
              href="#"
              className="hover:text-inverse-on-surface/70 transition-colors"
            >
              KVKK
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
