import { Star } from "lucide-react";

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

export function TestimonialsSection() {
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
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
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
                  <div className="text-sm font-semibold text-on-surface">
                    {t.name}
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    {t.title}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
