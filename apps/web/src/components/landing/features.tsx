import Link from "next/link";
import { Plug, Brain, BookOpen, Truck, Zap, Receipt } from "lucide-react";

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

export function FeaturesSection() {
  return (
    <section id="features" className="bg-surface-container-low py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface mb-4">
              Her Şey Tek Platformda
            </h2>
            <p className="text-lg text-on-surface-variant max-w-xl">
              Doğum günü yönetiminden faturaya, çalışan mutluluğunu artıracak
              tüm araçlar burada.
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
                <h3 className="font-headline text-lg font-bold text-on-surface mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
