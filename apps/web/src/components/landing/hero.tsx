import Link from "next/link";
import { Cake, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="pt-16 pb-24 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground mb-8">
              <span>🎂</span>
              <span>
                Türkiye&apos;nin ilk kurumsal pasta teslimat platformu
              </span>
            </div>

            {/* Heading */}
            <h1 className="font-headline text-5xl leading-[1.2] md:text-6xl font-extrabold text-foreground md:leading-[1.3] tracking-tight mb-6">
              Çalışanlarınızın Doğum Günlerini{" "}
              <span className="text-primary italic">Asla</span> Unutmayın
            </h1>

            {/* Description */}
            <p className="text-lg text-muted leading-relaxed mb-8 max-w-lg">
              CakeDay, çalışanlarınızın doğum günü kutlamalarını tamamen
              otomatikleştirir. Siz kuralları belirleyin, biz pastayı kapıya
              teslim edelim.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button asChild size="lg" className="px-10 font-bold">
                <Link href="/register">Hemen Başla</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="px-10 font-bold"
              >
                <Link href="#how-it-works">Nasıl Çalışır?</Link>
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 bg-background-secondary px-4 py-2 rounded-full">
                <span className="text-sm text-muted">
                  📍 Şimdilik İstanbul&apos;da belirlenen ilçelerde aktif
                </span>
              </div>
            </div>
          </div>

          {/* Right: Glass card mockup */}
          <div className="hidden lg:flex items-center justify-center relative">
            {/* Decorative blur circle */}
            <div className="absolute w-72 h-72 rounded-full opacity-20 blur-3xl bg-gradient-to-br from-primary-container to-secondary" />

            <div className="relative glass-card border border-border-soft rounded-3xl p-6 w-full max-w-sm shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-headline font-bold text-foreground text-base">
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
                    color: "bg-primary",
                  },
                  {
                    name: "Zeynep Kaya",
                    dept: "Pazarlama",
                    date: "Yarın",
                    status: "Hazırlanıyor",
                    statusColor: "text-amber-700 bg-amber-100",
                    initials: "ZK",
                    color: "bg-secondary",
                  },
                  {
                    name: "Mert Demir",
                    dept: "Satış",
                    date: "2 gün sonra",
                    status: "Planlandı",
                    statusColor: "text-blue-700 bg-blue-100",
                    initials: "MD",
                    color: "bg-muted",
                  },
                ].map((emp) => (
                  <div
                    key={emp.name}
                    className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${emp.color}`}
                    >
                      {emp.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-foreground truncate">
                          {emp.name}
                        </span>
                        <Cake className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      </div>
                      <div className="text-xs text-muted">
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

              <div className="mt-4 pt-4 border-t border-border-soft flex items-center justify-between text-xs text-muted">
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
