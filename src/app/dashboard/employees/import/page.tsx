import Link from "next/link";
import { ArrowLeft, FileSpreadsheet, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CsvImport } from "@/components/employees/csv-import";

export default function ImportEmployeesPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="h-9 w-9 rounded-xl border border-border-soft bg-background shadow-sm hover:bg-background-secondary"
        >
          <Link href="/dashboard/employees">
            <ArrowLeft className="h-4 w-4 text-muted" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground font-headline">CSV ile Toplu Yükleme</h1>
          <p className="text-sm text-muted mt-0.5">
            CSV dosyanızı yükleyerek çalışanları toplu olarak ekleyin.
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {[
          { n: 1, label: "Dosya Seç" },
          { n: 2, label: "Önizle" },
          { n: 3, label: "İçe Aktar" },
        ].map((step, i) => (
          <div key={step.n} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step.n === 1 ? "gradient-primary text-white" : "bg-background-secondary text-muted"
              }`}>
                {step.n}
              </div>
              <span className={`text-xs font-medium ${step.n === 1 ? "text-foreground" : "text-muted"}`}>
                {step.label}
              </span>
            </div>
            {i < 2 && <div className="h-px w-8 bg-border-soft mx-1" />}
          </div>
        ))}
      </div>

      {/* Format Info Card */}
      <div className="bg-background rounded-2xl border border-border-soft/30 shadow-sm p-6">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-foreground mb-1">CSV Formatı</h2>
            <p className="text-sm text-muted mb-3">
              Dosyanızın ilk satırında aşağıdaki sütun başlıkları bulunmalıdır:
            </p>
            <div className="rounded-xl bg-background-secondary border border-border-soft/30 font-mono text-xs p-3 text-foreground overflow-x-auto">
              first_name, last_name, date_of_birth, department, work_email, district
            </div>
            <div className="mt-3 space-y-1.5">
              {[
                "Tarih formatı: YYYY-MM-DD (örn: 1990-05-15)",
                "İlçe değerleri: besiktas veya sariyer",
                "E-posta adresleri opsiyoneldir",
              ].map((note) => (
                <div key={note} className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  <p className="text-xs text-muted">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Import Component */}
      <div className="bg-background rounded-2xl border border-border-soft/30 shadow-sm p-6">
        <CsvImport />
      </div>
    </div>
  );
}
