import Link from "next/link";
import { Cake, CheckCircle2, Users, Bell, BarChart3, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Users,
    title: "Kolay Çalışan Yönetimi",
    description:
      "Excel/CSV ile toplu yükleme, BambooHR/KolayIK entegrasyonu. Çalışan ekleyip güncellemek sadece birkaç tıklama.",
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
];

const testimonials = [
  {
    name: "Ayşe Kaya",
    title: "İK Müdürü, TechCorp",
    text: "CakeDay sayesinde 120 çalışanın doğum günlerini hiç atlamıyoruz. Müthiş kolaylık!",
  },
  {
    name: "Mehmet Demir",
    title: "Genel Müdür, StartupHub",
    text: "Kurulum 10 dakika sürdü. İlk siparişimiz o gün verildi. Tavsiye ederim.",
  },
  {
    name: "Zeynep Arslan",
    title: "İK Direktörü, GlobalFin",
    text: "Pastaların kalitesi harika, teslimat her seferinde zamanında. Çalışanlarımız çok memnun.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-border bg-white/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Cake className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold">CakeDay</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Giriş Yap</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Ücretsiz Başla</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Star className="h-3.5 w-3.5" />
            İstanbul'da 50+ şirketin tercihi
          </div>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Çalışanlarınızın Doğum Günlerini{" "}
            <span className="text-primary">Otomatik</span> Kutlayın
          </h1>
          <p className="mb-10 text-xl text-muted-foreground leading-relaxed">
            CakeDay, şirketlerin çalışan doğum günlerini unutmamasını sağlayan B2B pasta teslimat platformudur. Kural tanımlayın, gerisini biz halledelim.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="px-8">
              <Link href="/register">
                Şirketinizi Kaydedin
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Nasıl Çalışır?</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <section className="border-y border-border bg-muted/30 py-10">
        <div className="container">
          <p className="text-center text-sm text-muted-foreground mb-6">
            Güvenen şirketler
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {["TechCorp", "StartupHub", "GlobalFin", "MediGroup", "EduPlus"].map((name) => (
              <span key={name} className="text-lg font-semibold text-muted-foreground/60">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Her Şey Otomatik</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Çalışan listesini yükleyin, kuralları tanımlayın. CakeDay her doğum gününde siparişi otomatik verir.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="border border-border hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">3 Adımda Başlayın</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Şirketi Kaydedin", desc: "5 dakikada şirket kaydı oluşturun." },
              { step: "2", title: "Çalışanları Yükleyin", desc: "CSV ile toplu yükleme veya tek tek ekleme." },
              { step: "3", title: "Kuralları Tanımlayın", desc: "Hangi doğum günleri için pasta gönderileceğini belirleyin." },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Müşterilerimiz Ne Diyor?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <Card key={t.name} className="border border-border">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-20">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Çalışanlarınızı Mutlu Edin
          </h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Ücretsiz başlayın. Kredi kartı gerekmez.
          </p>
          <Button size="lg" variant="secondary" asChild className="px-10">
            <Link href="/register">Hemen Başla</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cake className="h-5 w-5 text-primary" />
            <span className="font-semibold">CakeDay</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">Gizlilik Politikası</Link>
            <Link href="#" className="hover:text-foreground">Kullanım Şartları</Link>
            <Link href="#" className="hover:text-foreground">İletişim</Link>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 CakeDay. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
