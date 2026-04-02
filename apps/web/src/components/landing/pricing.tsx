import Link from "next/link";

export function PricingSection() {
  return (
    <section id="pricing" className="bg-surface-container-high py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface mb-4">
            Nasıl Çalışır?
          </h2>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            Üyelik ücreti yoktur. Kaydolun, çalışanlarınızı ekleyin,
            siparişlerinizi planlayın. Ay sonunda sadece sipariş ettiğiniz
            pastalar için fatura kesilir.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: "🎂",
              title: "Pasta Seçimi",
              description:
                "Pasta çeşidi ve boyutuna göre fiyatlandırma. Küçük, orta ve büyük boy seçenekleri.",
            },
            {
              icon: "📋",
              title: "Sipariş Planı",
              description:
                "Otomatik kurallarla veya tek seferlik siparişlerle çalışanlarınızın kutlamalarını planlayın.",
            },
            {
              icon: "🧾",
              title: "Aylık Fatura",
              description:
                "Ay sonunda toplam sipariş sayınıza göre tek bir konsolide fatura kesilir.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-surface-container-lowest rounded-2xl border border-primary p-8 text-center"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-headline font-bold text-on-surface text-lg mb-3">
                {item.title}
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {item.description}
              </p>
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
