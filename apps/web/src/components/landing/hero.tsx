import Link from "next/link";
import { Cake, Play } from "lucide-react";

export function HeroSection() {
  return (
    <section className="pt-16 pb-24 bg-surface-container-lowest relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary-fixed px-4 py-1.5 text-sm font-medium text-on-secondary-container mb-8">
              <span>🎂</span>
              <span>
                Türkiye&apos;nin ilk kurumsal pasta teslimat platformu
              </span>
            </div>

            {/* Heading */}
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-on-surface leading-[1.1] tracking-tight mb-6">
              Çalışanlarınızın Doğum Günlerini{" "}
              <span className="text-primary italic">Asla</span> Unutmayın
            </h1>

            {/* Description */}
            <p className="text-lg text-on-surface-variant leading-relaxed mb-8 max-w-lg">
              CakeDay, çalışanlarınızın doğum günü kutlamalarını tamamen
              otomatikleştirir. Siz kuralları belirleyin, biz pastayı kapıya
              teslim edelim.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link
                href="/register"
                className="gradient-primary text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg hover:opacity-90 transition-opacity text-base text-center"
              >
                Hemen Başla
              </Link>
              <a
                href="#how-it-works"
                className="flex items-center justify-center gap-2 border border-outline text-on-surface font-semibold px-8 py-3.5 rounded-xl hover:bg-surface-container-low transition-colors text-base"
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <Play className="h-3.5 w-3.5 text-primary fill-primary" />
                </div>
                Nasıl Çalışır?
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-full">
                <span className="text-sm text-on-surface-variant">
                  📍 Şimdilik İstanbul&apos;da belirlenen ilçelerde aktif
                </span>
              </div>
            </div>
          </div>

          {/* Right: Glass card mockup */}
          <div className="hidden lg:flex items-center justify-center relative">
            {/* Decorative blur circle */}
            <div
              className="absolute w-72 h-72 rounded-full opacity-20 blur-3xl"
              style={{
                background: "linear-gradient(135deg, #f97316, #b4136d)",
              }}
            />

            <div className="relative glass-card border border-outline-variant rounded-3xl p-6 w-full max-w-sm shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-headline font-bold text-on-surface text-base">
                  Yaklaşan Kutlamalar
                </h3>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  Bu Hafta
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    name: "Can Yılmaz",
                    dept: "Yazılım",
                    date: "Bugün",
                    status: "Teslim Edildi",
                    statusColor: "text-green-700 bg-green-100",
                    initials: "CY",
                    color: "#9d4300",
                  },
                  {
                    name: "Zeynep Kaya",
                    dept: "Pazarlama",
                    date: "Yarın",
                    status: "Hazırlanıyor",
                    statusColor: "text-amber-700 bg-amber-100",
                    initials: "ZK",
                    color: "#b4136d",
                  },
                  {
                    name: "Mert Demir",
                    dept: "Satış",
                    date: "2 gün sonra",
                    status: "Planlandı",
                    statusColor: "text-blue-700 bg-blue-100",
                    initials: "MD",
                    color: "#855300",
                  },
                ].map((emp) => (
                  <div
                    key={emp.name}
                    className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: emp.color }}
                    >
                      {emp.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-on-surface truncate">
                          {emp.name}
                        </span>
                        <Cake className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        {emp.dept} · {emp.date}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${emp.statusColor}`}
                    >
                      {emp.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-outline-variant flex items-center justify-between text-xs text-on-surface-variant">
                <span>Bu ay toplam</span>
                <span className="font-bold text-primary text-sm">
                  12 kutlama
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
