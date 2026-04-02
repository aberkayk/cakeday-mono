import Link from "next/link";

export function CTASection() {
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
              Hemen kaydolun, çalışanlarınızı ekleyin ve kutlamaları
              otomatikleştirin.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link
                href="/register"
                className="bg-white text-primary font-bold px-10 py-3.5 rounded-xl hover:bg-white/90 transition-colors text-base"
              >
                Hemen Başla
              </Link>
            </div>

            <p className="text-white/70 text-sm">
              Üyelik ücreti yok · Sadece sipariş başına ödeme
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
