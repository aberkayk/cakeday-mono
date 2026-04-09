import { Users, ListChecks, Truck } from "lucide-react";

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

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-background py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-foreground mb-4 relative inline-block">
            3 Adımda Başlayın
            <span className="absolute -bottom-2 left-0 right-0 h-1.5 rounded-full gradient-primary" />
          </h2>
          <p className="mt-6 text-lg text-muted max-w-xl mx-auto">
            Birkaç dakika içinde sistemi kurun ve çalışan doğum günlerini
            unutmayı bırakın.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center mb-5">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <div className="text-sm font-bold text-primary mb-1">
                  Adım {i + 1}
                </div>
                <h3 className="font-headline text-xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
