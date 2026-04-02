"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

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

export function FAQSection() {
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
                  <span className="font-semibold text-on-surface text-sm">
                    {item.q}
                  </span>
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
