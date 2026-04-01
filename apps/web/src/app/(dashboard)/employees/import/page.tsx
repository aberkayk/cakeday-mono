import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CsvImport } from "@/components/employees/csv-import";

export default function ImportEmployeesPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/employees">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">CSV ile Toplu Yükleme</h1>
          <p className="text-muted-foreground text-sm mt-1">
            CSV dosyanızı yükleyerek çalışanları toplu olarak ekleyin.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="font-semibold mb-1">CSV Formatı</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Dosyanızın ilk satırında aşağıdaki sütun başlıkları bulunmalıdır:
        </p>
        <div className="rounded-md bg-muted font-mono text-xs p-3 overflow-x-auto">
          first_name,last_name,date_of_birth,department,work_email,district
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Tarih formatı: YYYY-MM-DD (örn: 1990-05-15). İlçe değerleri: besiktas veya sariyer.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <CsvImport />
      </div>
    </div>
  );
}
