"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Cake,
  Users,
  ListChecks,
  Truck,
  Play,
  CheckCircle,
  ChevronDown,
  Star,
  Menu,
  X,
  Plug,
  Brain,
  BookOpen,
  Zap,
  Receipt,
} from "lucide-react";

// ─── Data ───────────────────────────────────────────────────────────────────

const steps = [
  {
    icon: Users,
    title: "Çalışanlarınızı Ekleyin",
    description:
      "Excel, CSV veya HR sistem entegrasyonu ile çalışanlarınızı platforma kolayca aktarın.",
  },
  {
    icon: ListChecks,
    title: "Kuralları Belirleyin",
    description:
      "Hangi departmanlara, hangi bütçeyle, hangi pasta modellerinin gönderileceğini ayarlayın.",
  },
  {
    icon: Truck,
    title: "Biz Teslim Edelim",
    description:
      "Doğum günü geldiğinde pasta otomatik olarak siparişe alınır ve kapıya teslim edilir.",
  },
];

const features = [
  {
    icon: Plug,
    title: "HR Entegrasyonu",
    description:
      "BambooHR ve KolayIK ile tek tıkla entegrasyon. Çalışan verilerini otomatik senkronize edin.",
  },
  {
    icon: Brain,
    title: "Akıllı Kurallar",
    description:
      "Departmana, kıdeme veya konuma göre farklı pasta seçenekleri ve bütçe kuralları tanımlayın.",
  },
  {
    icon: BookOpen,
    title: "Pasta Kataloğu",
    description:
      "Anlaşmalı pastanelerimizden özenle seçilmiş pasta seçenekleri. Her damak zevkine uygun.",
  },
  {
    icon: Truck,
    title: "Otomatik Teslimat",
    description:
      "Sipariş oluşturma, onay, hazırlama ve teslimat süreçlerinin tamamı otomatik yönetilir.",
  },
  {
    icon: Zap,
    title: "Tek Sipariş",
    description:
      "Tüm çalışanların kutlamalarını tek bir platform üzerinden yönetin. Çoklu sipariş takibi artık sorun değil.",
  },
  {
    icon: Receipt,
    title: "Kolay Faturalama",
    description:
      "Aylık konsolide fatura, e-fatura desteği ve muhasebe entegrasyonu ile finansal süreçleri kolaylaştırın.",
  },
];

const testimonials = [
  {
    name: "Ayşe Kaya",
    title: "İK Müdürü, TechCorp",
    initials: "AK",
    color: "bg-primary/80",
    quote:
      "CakeDay sayesinde 120 çalışanın doğum günlerini hiç atlamıyoruz. Müthiş bir kolaylık sağladı, çalışan memnuniyetimiz gözle görülür arttı.",
  },
  {
    name: "Mehmet Demir",
    title: "Genel Müdür, StartupHub",
    initials: "MD",
    color: "bg-secondary/70",
    quote:
      "Kurulum 10 dakika sürdü, ilk siparişimiz aynı gün verildi. Hem hızlı hem güvenilir. Tüm İK ekiplerine kesinlikle tavsiye ederim.",
  },
  {
    name: "Zeynep Arslan",
    title: "İK Direktörü, GlobalFin",
    initials: "ZA",
    color: "bg-tertiary/70",
    quote:
      "Pastaların kalitesi harika, teslimat her seferinde zamanında. Ekibimiz çok memnun; artık doğum günlerini unutmak mümkün değil.",
  },
];

const faqItems = [
  {
    q: "CakeDay nasıl çalışır?",
    a: "Şirketinizi kaydettikten sonra çalışanlarınızı platforma ekleyin, sipariş kurallarınızı belirleyin. Sistem, doğum günleri yaklaşırken otomatik sipariş oluşturur ve teslimatı organize eder.",
  },
  {
    q: "Hangi bölgelere teslimat yapıyorsunuz?",
    a: "Şimdilik İstanbul'da belirlenen ilçelerde hizmet veriyoruz. Yeni bölgeler yakında eklenecektir.",
  },
  {
    q: "HR sistemimizle entegre olabiliyor mu?",
    a: "Evet! BambooHR ve KolayIK entegrasyonları sunuyoruz. Ayrıca CSV/Excel ile de toplu çalışan yüklemesi yapabilirsiniz.",
  },
  {
    q: "Faturalama nasıl işliyor?",
    a: "Her ay sonunda tüm siparişleriniz için tek bir konsolide fatura kesilir. E-fatura ve kurumsal fatura desteği mevcuttur.",
  },
  {
    q: "Üyelik ücreti var mı?",
    a: "Hayır, üyelik ücreti yoktur. Sadece sipariş ettiğiniz pastalar için pasta çeşidi ve boyutuna göre ücretlendirilirsiniz. Ay sonunda toplam siparişleriniz için tek bir fatura kesilir.",
  },
  {
    q: "Pasta seçeneklerini özelleştirebilir miyim?",
    a: "Evet, departmana veya çalışan tercihlerine göre farklı pasta seçenekleri ve fiyat aralıkları belirleyebilirsiniz. Kataloğumuz sürekli genişlemektedir.",
  },
];

const logos = ["VOLTA", "NEXUS", "ZEPHYR", "ORION", "LUMOS", "APEX"];

// ─── Components ─────────────────────────────────────────────────────────────

function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 flex flex-col items-center pt-3 px-4">
      <div className="bg-[#3E2723] rounded-full px-3 py-1.5 flex items-center gap-1 max-w-3xl w-full shadow-lg">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 px-3 py-1.5">
          <Cake className="h-5 w-5 text-white" strokeWidth={2} />
          <span className="font-headline font-bold text-base text-white italic">CakeDay</span>
        </Link>

        {/* Center nav — desktop */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {["Nasıl Çalışır", "Özellikler", "Ücretlendirme", "SSS", "İletişim"].map((label) => {
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
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden mt-2 bg-[#3E2723] rounded-2xl px-4 py-3 space-y-1 w-full max-w-3xl shadow-lg">
          {["Nasıl Çalışır", "Özellikler", "Ücretlendirme", "SSS", "İletişim"].map((label) => {
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

function HeroSection() {
  return (
    <section className="pt-16 pb-24 bg-surface-container-lowest relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary-fixed px-4 py-1.5 text-sm font-medium text-on-secondary-container mb-8">
              <span>🎂</span>
              <span>Türkiye&apos;nin ilk kurumsal pasta teslimat platformu</span>
            </div>

            {/* Heading */}
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-on-surface leading-[1.1] tracking-tight mb-6">
              Çalışanlarınızın Doğum Günlerini{" "}
              <span className="text-primary italic">Asla</span> Unutmayın
            </h1>

            {/* Description */}
            <p className="text-lg text-on-surface-variant leading-relaxed mb-8 max-w-lg">
              CakeDay, çalışanlarınızın doğum günü kutlamalarını tamamen otomatikleştirir.
              Siz kuralları belirleyin, biz pastayı kapıya teslim edelim.
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
                <span className="text-sm text-on-surface-variant">📍 Şimdilik İstanbul&apos;da belirlenen ilçelerde aktif</span>
              </div>
            </div>
          </div>

          {/* Right: Glass card mockup */}
          <div className="hidden lg:flex items-center justify-center relative">
            {/* Decorative blur circle */}
            <div
              className="absolute w-72 h-72 rounded-full opacity-20 blur-3xl"
              style={{ background: "linear-gradient(135deg, #f97316, #b4136d)" }}
            />

            <div
              className="relative glass-card border border-outline-variant rounded-3xl p-6 w-full max-w-sm shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500"
            >
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
                <span className="font-bold text-primary text-sm">12 kutlama</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LogosSection() {
  return null;
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-surface py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface mb-4 relative inline-block">
            3 Adımda Başlayın
            <span
              className="absolute -bottom-2 left-0 right-0 h-1.5 rounded-full gradient-primary"
            />
          </h2>
          <p className="mt-6 text-lg text-on-surface-variant max-w-xl mx-auto">
            Birkaç dakika içinde sistemi kurun ve çalışan doğum günlerini unutmayı bırakın.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center mb-5">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <div className="text-sm font-bold text-primary mb-1">Adım {i + 1}</div>
                <h3 className="font-headline text-xl font-bold text-on-surface mb-3">
                  {step.title}
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="bg-surface-container-low py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface mb-4">
              Her Şey Tek Platformda
            </h2>
            <p className="text-lg text-on-surface-variant max-w-xl">
              Doğum günü yönetiminden faturaya, çalışan mutluluğunu artıracak tüm araçlar burada.
            </p>
          </div>
          <Link
            href="/register"
            className="gradient-primary text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm whitespace-nowrap"
          >
            Tüm Özellikleri Gör
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-white p-10 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-headline text-lg font-bold text-on-surface mb-2">{f.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="bg-surface py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface mb-4">
            Müşterilerimiz Ne Diyor?
          </h2>
          <p className="text-lg text-on-surface-variant">
            Yüzlerce şirketten gerçek deneyimler.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-surface-container-low rounded-2xl p-8 flex flex-col gap-5"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-on-surface-variant text-sm leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Avatar + name */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-on-surface">{t.name}</div>
                  <div className="text-xs text-on-surface-variant">{t.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="bg-surface-container-high py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface mb-4">
            Nasıl Çalışır?
          </h2>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            Üyelik ücreti yoktur. Kaydolun, çalışanlarınızı ekleyin, siparişlerinizi planlayın.
            Ay sonunda sadece sipariş ettiğiniz pastalar için fatura kesilir.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: "🎂",
              title: "Pasta Seçimi",
              description: "Pasta çeşidi ve boyutuna göre fiyatlandırma. Küçük, orta ve büyük boy seçenekleri.",
            },
            {
              icon: "📋",
              title: "Sipariş Planı",
              description: "Otomatik kurallarla veya tek seferlik siparişlerle çalışanlarınızın kutlamalarını planlayın.",
            },
            {
              icon: "🧾",
              title: "Aylık Fatura",
              description: "Ay sonunda toplam sipariş sayınıza göre tek bir konsolide fatura kesilir.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-8 text-center">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-headline font-bold text-on-surface text-lg mb-3">{item.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/register"
            className="inline-block gradient-primary text-white font-semibold px-10 py-3.5 rounded-xl shadow-lg hover:opacity-90 transition-opacity text-base"
          >
            Hemen Başla
          </Link>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-surface py-24">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface mb-4">
            Sıkça Sorulan Sorular
          </h2>
          <p className="text-lg text-on-surface-variant">
            Aklınızdaki soruların cevabını bulamadıysanız bize ulaşın.
          </p>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                >
                  <span className="font-semibold text-on-surface text-sm">{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-on-surface-variant flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-sm text-on-surface-variant leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="gradient-primary rounded-2xl p-12 md:p-16 text-white text-center relative overflow-hidden">
          {/* Decorative blur circles */}
          <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10">
            <h2 className="font-headline text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
              Çalışanlarınızın Doğum Günlerini
              <br />
              Kutlamaya Başlayın
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
              Hemen kaydolun, çalışanlarınızı ekleyin ve kutlamaları otomatikleştirin.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link
                href="/register"
                className="bg-white text-primary font-bold px-10 py-3.5 rounded-xl hover:bg-white/90 transition-colors text-base"
              >
                Hemen Başla
              </Link>
            </div>

            <p className="text-white/70 text-sm">Üyelik ücreti yok · Sadece sipariş başına ödeme</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-inverse-surface text-inverse-on-surface/70 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <Cake className="h-6 w-6 text-inverse-primary" />
              <span className="font-headline font-bold text-lg text-inverse-on-surface">CakeDay</span>
            </Link>
            <p className="text-sm leading-relaxed text-inverse-on-surface/50">
              B2B doğum günü pasta teslimat platformu. Çalışan mutluluğunu otomatikleştirin.
            </p>
          </div>

          {/* Ürün */}
          <div>
            <p className="text-sm font-semibold text-inverse-on-surface mb-4">Ürün</p>
            <ul className="space-y-2 text-sm">
              {["Özellikler", "Ücretlendirme", "Nasıl Çalışır", "Kaydol"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-inverse-on-surface transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Şirket */}
          <div>
            <p className="text-sm font-semibold text-inverse-on-surface mb-4">Şirket</p>
            <ul className="space-y-2 text-sm">
              {["Hakkımızda", "Blog", "Kariyer", "İletişim"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-inverse-on-surface transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Destek */}
          <div>
            <p className="text-sm font-semibold text-inverse-on-surface mb-4">Destek</p>
            <ul className="space-y-2 text-sm">
              {[
                "Gizlilik Politikası",
                "Kullanım Şartları",
                "KVKK",
                "Çerez Politikası",
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-inverse-on-surface transition-colors">
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
            <a href="#" className="hover:text-inverse-on-surface/70 transition-colors">
              Gizlilik
            </a>
            <a href="#" className="hover:text-inverse-on-surface/70 transition-colors">
              Şartlar
            </a>
            <a href="#" className="hover:text-inverse-on-surface/70 transition-colors">
              KVKK
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <NavBar />
      <HeroSection />
      <LogosSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
