"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Cake,
  Users,
  Bell,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Clock,
  Menu,
  X,
  Building2,
  FileSpreadsheet,
  Settings2,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Users,
    title: "Kolay Çalışan Yönetimi",
    description:
      "Excel/CSV ile toplu yükleme, BambooHR ve KolayIK entegrasyonu. Çalışanları saniyeler içinde ekleyin.",
  },
  {
    icon: Bell,
    title: "Otomatik Sipariş",
    description:
      "Kural tabanlı otomatik siparişler. Her doğum günü için özel pasta, özel mesaj — hiçbirini kaçırmadan.",
  },
  {
    icon: Cake,
    title: "Seçkin Pastaneler",
    description:
      "İstanbul'un en iyi pastanelerinden el yapımı pastalar. Beşiktaş ve Sarıyer'e kapıya teslimat.",
  },
  {
    icon: BarChart3,
    title: "Detaylı Raporlar",
    description:
      "Sipariş geçmişi, fatura takibi, çalışan kutlama özeti. Tüm verileriniz tek ekranda.",
  },
  {
    icon: Zap,
    title: "Hızlı Kurulum",
    description:
      "10 dakikada sistemi kurun, ilk siparişinizi verin. Teknik bilgi gerektirmez.",
  },
  {
    icon: Shield,
    title: "Güvenli Ödeme",
    description:
      "iyzico altyapısıyla güvenli ödeme. Aylık fatura, kurumsal fatura desteği.",
  },
];

const steps = [
  {
    number: "01",
    icon: Building2,
    title: "Kayıt",
    description: "Şirketinizi dakikalar içinde kaydedin ve hesabınızı oluşturun.",
  },
  {
    number: "02",
    icon: FileSpreadsheet,
    title: "Çalışanlar",
    description: "HR sisteminizden veya CSV ile çalışanlarınızı ekleyin.",
  },
  {
    number: "03",
    icon: Settings2,
    title: "Kurallar",
    description: "Otomatik sipariş kurallarını belirleyin, bütçenizi ayarlayın.",
  },
  {
    number: "04",
    icon: Truck,
    title: "Teslimat",
    description: "Pastanelerimiz doğum günleri için zamanında teslim etsin.",
  },
];

const testimonials = [
  {
    name: "Ayşe Kaya",
    title: "İK Müdürü",
    company: "TechCorp",
    initials: "AK",
    text: "CakeDay sayesinde 120 çalışanın doğum günlerini hiç atlamıyoruz. Müthiş kolaylık! Çalışanlarımızın mutluluğu arttı.",
  },
  {
    name: "Mehmet Demir",
    title: "Genel Müdür",
    company: "StartupHub",
    initials: "MD",
    text: "Kurulum 10 dakika sürdü. İlk siparişimiz o gün verildi. Hem hızlı hem güvenilir, kesinlikle tavsiye ederim.",
  },
  {
    name: "Zeynep Arslan",
    title: "İK Direktörü",
    company: "GlobalFin",
    initials: "ZA",
    text: "Pastaların kalitesi harika, teslimat her seferinde zamanında. Çalışanlarımız çok memnun, biz de.",
  },
];

const logos = [
  "TechCorp", "StartupHub", "GlobalFin", "MediGroup", "EduPlus",
  "FinTech AS", "RetailPro", "LogiBase", "HealthCare+", "DevStudio",
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#1a1a2e]">
      {/* ─── Sticky Navbar ─── */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[#1a1a2e]">
            <span className="text-2xl">🎂</span>
            <span>CakeDay</span>
          </Link>

          {/* Center nav — desktop */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#how-it-works" className="hover:text-[#1a1a2e] transition-colors">
              Nasıl Çalışır
            </a>
            <a href="#features" className="hover:text-[#1a1a2e] transition-colors">
              Özellikler
            </a>
            <a href="#pricing" className="hover:text-[#1a1a2e] transition-colors">
              Fiyatlandırma
            </a>
          </nav>

          {/* Right CTAs — desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild className="text-sm font-medium">
              <Link href="/login">Giriş Yap</Link>
            </Button>
            <Button
              asChild
              className="bg-[#F97316] hover:bg-[#ea580c] text-white font-semibold rounded-xl px-5"
            >
              <Link href="/register">Kutlamaya Başla 🎂</Link>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Menü"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-3">
            <a href="#how-it-works" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMobileMenuOpen(false)}>
              Nasıl Çalışır
            </a>
            <a href="#features" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMobileMenuOpen(false)}>
              Özellikler
            </a>
            <a href="#pricing" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMobileMenuOpen(false)}>
              Fiyatlandırma
            </a>
            <div className="pt-2 flex flex-col gap-2">
              <Button variant="outline" asChild className="w-full">
                <Link href="/login">Giriş Yap</Link>
              </Button>
              <Button asChild className="w-full bg-[#F97316] hover:bg-[#ea580c] text-white font-semibold rounded-xl">
                <Link href="/register">Kutlamaya Başla 🎂</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* ─── Hero Section ─── */}
      <section className="min-h-[calc(100vh-64px)] flex items-center bg-gradient-to-br from-white via-[#FFF8F0] to-white">
        <div className="container py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: copy */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#FEF3C7] px-4 py-1.5 text-sm font-medium text-amber-700 mb-8">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                500+ şirket tarafından tercih ediliyor
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-[#1a1a2e] mb-6">
                Doğum günlerini iş yerinde{" "}
                <span className="text-[#F97316]">unutulmaz</span> kılın
              </h1>
              <p className="text-xl text-gray-500 leading-relaxed mb-10">
                CakeDay, çalışanlarınızın doğum günü kutlamalarını otomatikleştirir. Siz kuralları belirleyin, biz pastayı teslim edelim.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  asChild
                  className="bg-[#F97316] hover:bg-[#ea580c] text-white font-semibold rounded-xl px-8 text-base h-12"
                >
                  <Link href="/register">
                    Kutlamaya Başla 🎂
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="rounded-xl px-8 text-base h-12 border-gray-300 text-[#1a1a2e] hover:bg-gray-50"
                >
                  <a href="#how-it-works">Demo Planla</a>
                </Button>
              </div>
              <p className="mt-6 text-sm text-gray-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                İlk 30 gün ücretsiz · Kredi kartı gerekmez
              </p>
            </div>

            {/* Right: decorative */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                {/* Main big cake */}
                <div className="w-72 h-72 rounded-3xl bg-gradient-to-br from-[#FEF3C7] to-[#FED7AA] flex items-center justify-center shadow-2xl">
                  <span className="text-9xl">🎂</span>
                </div>
                {/* Floating cards */}
                <div className="absolute -top-6 -right-8 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3 border border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#1a1a2e]">Pasta Teslim Edildi</p>
                    <p className="text-xs text-gray-400">Ayşe K. — bugün</p>
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-8 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3 border border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-[#F97316]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#1a1a2e]">Yarın 3 doğum günü</p>
                    <p className="text-xs text-gray-400">Sipariş otomatik verildi</p>
                  </div>
                </div>
                <div className="absolute top-1/2 -right-14 -translate-y-1/2 bg-[#1a1a2e] text-white rounded-2xl shadow-lg px-4 py-3">
                  <p className="text-2xl font-extrabold">127</p>
                  <p className="text-xs text-gray-300">kutlanan çalışan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Logo Carousel ─── */}
      <section className="py-16 border-y border-gray-100 bg-white overflow-hidden">
        <div className="container mb-8">
          <p className="text-center text-sm font-medium text-gray-400 uppercase tracking-widest">
            Güvendikleri şirketler
          </p>
        </div>
        <div className="relative overflow-hidden">
          <div className="carousel-track">
            {[...logos, ...logos].map((name, i) => (
              <div
                key={`${name}-${i}`}
                className="flex items-center justify-center h-10 px-8 rounded-lg bg-gray-100 min-w-[140px]"
              >
                <span className="text-sm font-semibold text-gray-400">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it Works ─── */}
      <section id="how-it-works" className="py-28 bg-[#1a1a2e] text-white">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-[#F97316] text-sm font-semibold uppercase tracking-widest mb-4">
              Süreç
            </p>
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-5">
              Sihir burada gerçekleşiyor
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Dört kolay adımda şirketinizi CakeDay'e bağlayın ve kutlamaları otomatikleştirin.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-5xl font-extrabold text-white/10">{step.number}</span>
                    <div className="w-12 h-12 rounded-xl bg-[#F97316]/20 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-[#F97316]" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-28 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-[#F97316] text-sm font-semibold uppercase tracking-widest mb-4">
              Özellikler
            </p>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1a1a2e] mb-5">
              Her şey tek platformda
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Doğum günü yönetiminden fatura takibine, çalışan mutluluğunu artıracak her araç burada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-gray-100 p-8 hover:border-[#F97316]/30 hover:shadow-lg hover:shadow-orange-50 transition-all"
                >
                  <div className="mb-5 w-12 h-12 rounded-xl bg-[#FFF8F0] flex items-center justify-center group-hover:bg-[#F97316]/10 transition-colors">
                    <Icon className="h-6 w-6 text-[#F97316]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1a2e] mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-28 bg-[#FFF8F0]">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-[#F97316] text-sm font-semibold uppercase tracking-widest mb-4">
              Referanslar
            </p>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1a1a2e] mb-5">
              Müşterilerimiz ne diyor?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {testimonials.map((t) => (
              <Card
                key={t.name}
                className="bg-white border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-6">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F97316] flex items-center justify-center text-white text-sm font-bold">
                      {t.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-[#1a1a2e] text-sm">{t.name}</p>
                      <p className="text-xs text-gray-400">
                        {t.title} · {t.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-28 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-[#F97316] text-sm font-semibold uppercase tracking-widest mb-4">
              Fiyatlandırma
            </p>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1a1a2e] mb-5">
              Her ölçeğe uygun plan
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Küçük ekiplerden kurumsal firmalara kadar herkes için uygun fiyat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 max-w-5xl mx-auto">
            {/* Başlangıç */}
            <div className="rounded-2xl border border-gray-200 p-8 flex flex-col">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Başlangıç
              </p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-[#1a1a2e]">Ücretsiz</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1 text-sm text-gray-600">
                {["5 çalışana kadar", "Temel raporlar", "E-posta bildirimleri", "Manuel sipariş"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" asChild className="rounded-xl border-gray-300">
                <Link href="/register">Ücretsiz Başla</Link>
              </Button>
            </div>

            {/* Pro — highlighted */}
            <div className="rounded-2xl border-2 border-[#F97316] p-8 flex flex-col relative shadow-lg shadow-orange-100">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[#F97316] text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide">
                  Popüler
                </span>
              </div>
              <p className="text-sm font-semibold text-[#F97316] uppercase tracking-wide mb-3">
                Pro
              </p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-[#1a1a2e]">₺299</span>
                <span className="text-gray-400 text-sm">/ay</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1 text-sm text-gray-600">
                {[
                  "50 çalışana kadar",
                  "Otomatik sipariş kuralları",
                  "Gelişmiş raporlar",
                  "WhatsApp bildirimleri",
                  "CSV/Excel içe aktarma",
                  "Öncelikli destek",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#F97316] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild className="bg-[#F97316] hover:bg-[#ea580c] text-white font-semibold rounded-xl">
                <Link href="/register">Kutlamaya Başla 🎂</Link>
              </Button>
            </div>

            {/* Kurumsal */}
            <div className="rounded-2xl border border-gray-200 bg-[#1a1a2e] p-8 flex flex-col">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Kurumsal
              </p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">Özel</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1 text-sm text-gray-400">
                {[
                  "Sınırsız çalışan",
                  "HR sistem entegrasyonu",
                  "Özel pasta tasarımı",
                  "Fatura ve muhasebe",
                  "Özel SLA",
                  "Hesap yöneticisi",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                asChild
                className="rounded-xl border-white/20 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/register">Teklif Alın</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="bg-[#1a1a2e] py-28">
        <div className="container text-center">
          <p className="text-[#F97316] text-sm font-semibold uppercase tracking-widest mb-6">
            Hadi Başlayalım
          </p>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
            Kutlamaya hazır mısınız?
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto">
            Çalışanlarınızın doğum günlerini unutulmaz kılın. İlk 30 gün tamamen ücretsiz.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-white text-[#1a1a2e] hover:bg-gray-100 font-bold rounded-xl px-10 text-base h-12"
            >
              <Link href="/register">Kutlamaya Başla 🎂</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white/20 text-white hover:bg-white/10 hover:text-white rounded-xl px-10 text-base h-12"
            >
              <Link href="/login">Giriş Yap</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            <Clock className="inline h-3.5 w-3.5 mr-1" />
            İlk 30 gün ücretsiz · Kredi kartı gerekmez · İstediğiniz zaman iptal edin
          </p>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-[#111120] text-gray-400 py-16">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 font-bold text-white text-lg mb-4">
                <span className="text-xl">🎂</span>
                CakeDay
              </Link>
              <p className="text-sm leading-relaxed text-gray-500">
                B2B doğum günü pasta teslimat platformu. Çalışan mutluluğunu otomatikleştirin.
              </p>
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-4">Ürün</p>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Özellikler</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Fiyatlandırma</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Nasıl Çalışır</a></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Kaydol</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-4">Şirket</p>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Hakkımızda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kariyer</a></li>
                <li><a href="#" className="hover:text-white transition-colors">İletişim</a></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-4">Yasal</p>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Gizlilik Politikası</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kullanım Şartları</a></li>
                <li><a href="#" className="hover:text-white transition-colors">KVKK</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Çerez Politikası</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p>© 2026 CakeDay · İstanbul'da 🎂 ile yapıldı</p>
            <p className="text-gray-600">Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
