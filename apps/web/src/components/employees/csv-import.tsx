"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, X, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { employeesApi } from "@/lib/api";

interface ParsedEmployee {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  department?: string;
  work_email?: string;
  delivery_district?: string;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

function parseCSV(text: string): { rows: ParsedEmployee[]; errors: string[] } {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return { rows: [], errors: ["CSV dosyası boş veya geçersiz."] };

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
  const rows: ParsedEmployee[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });

    if (!row["first_name"] && !row["ad"]) {
      errors.push(`Satır ${i + 1}: Ad alanı boş.`);
      continue;
    }
    if (!row["date_of_birth"] && !row["dogum_tarihi"]) {
      errors.push(`Satır ${i + 1}: Doğum tarihi boş.`);
      continue;
    }

    rows.push({
      first_name: row["first_name"] || row["ad"] || "",
      last_name: row["last_name"] || row["soyad"] || "",
      date_of_birth: row["date_of_birth"] || row["dogum_tarihi"] || "",
      department: row["department"] || row["departman"] || undefined,
      work_email: row["work_email"] || row["email"] || undefined,
      delivery_district: row["district"] || row["ilce"] || undefined,
    });
  }

  return { rows, errors };
}

export function CsvImport() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParsedEmployee[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.name.endsWith(".csv")) {
      setParseErrors(["Sadece .csv dosyaları desteklenir."]);
      return;
    }
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { rows, errors } = parseCSV(text);
      setPreview(rows);
      setParseErrors(errors);
    };
    reader.readAsText(f, "UTF-8");
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile]
  );

  const handleImport = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await employeesApi.importCsv(formData);
      setResult(res.data);
    } catch (err) {
      setParseErrors([err instanceof Error ? err.message : "Yükleme başarısız."]);
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview([]);
    setParseErrors([]);
    setResult(null);
  };

  if (result) {
    return (
      <div className="py-8 text-center space-y-6">
        <div className="flex flex-col items-center">
          <div className="h-20 w-20 rounded-full bg-surface-container-low flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-tertiary" />
          </div>
          <h2 className="text-xl font-bold font-headline text-on-surface mb-1">🎉 İçe Aktarım Tamamlandı!</h2>
          <p className="text-sm text-on-surface-variant">Çalışanlar başarıyla sisteme eklendi.</p>
        </div>

        <div className="flex justify-center gap-8">
          <div className="text-center">
            <p className="text-4xl font-bold text-tertiary">{result.imported}</p>
            <p className="text-sm text-on-surface-variant mt-1">Başarıyla Eklendi</p>
          </div>
          {result.skipped > 0 && (
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{result.skipped}</p>
              <p className="text-sm text-on-surface-variant mt-1">Atlandı</p>
            </div>
          )}
        </div>

        {result.errors.length > 0 && (
          <div className="text-left rounded-xl bg-red-50 border border-red-100 p-4 space-y-1 max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm font-semibold text-red-700">Hatalar</p>
            </div>
            {result.errors.map((e, i) => (
              <p key={i} className="text-xs text-red-600">{e}</p>
            ))}
          </div>
        )}

        <Button
          onClick={reset}
          variant="outline"
          className="rounded-xl border-outline-variant text-on-surface"
        >
          Yeni Yükleme Yap
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all",
          isDragging
            ? "border-primary bg-primary-fixed/40"
            : "border-outline-variant hover:border-primary/50 hover:bg-primary-fixed/20",
          file && "border-tertiary bg-surface-container-low/50"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => !file && fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {file ? (
          <div className="flex items-center justify-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
              <FileText className="h-6 w-6 text-tertiary" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-on-surface">{file.name}</p>
              <p className="text-sm text-on-surface-variant">
                {preview.length} çalışan tespit edildi
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 ml-2 rounded-xl hover:bg-surface-container-low"
              onClick={(e) => { e.stopPropagation(); reset(); }}
            >
              <X className="h-4 w-4 text-on-surface-variant" />
            </Button>
          </div>
        ) : (
          <>
            <div className="h-16 w-16 rounded-2xl bg-surface-container-low flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-on-surface-variant" />
            </div>
            <p className="text-base font-semibold text-on-surface mb-1">CSV dosyanızı buraya sürükleyin</p>
            <p className="text-sm text-on-surface-variant">veya <span className="text-primary font-medium">tıklayarak seçin</span></p>
            <p className="text-xs text-on-surface-variant mt-4 bg-surface-container-low rounded-xl px-4 py-2 inline-block">
              Desteklenen sütunlar: first_name, last_name, date_of_birth, department, work_email, district
            </p>
          </>
        )}
      </div>

      {/* Parse errors */}
      {parseErrors.length > 0 && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm font-semibold text-red-700">Hatalı Satırlar</p>
          </div>
          {parseErrors.map((e, i) => (
            <p key={i} className="text-xs text-red-600">{e}</p>
          ))}
        </div>
      )}

      {/* Preview table */}
      {preview.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-on-surface">Önizleme</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">İlk 10 satır gösteriliyor</p>
            </div>
            <Badge className="bg-surface-container text-on-surface-variant border-0 font-semibold">
              {preview.length} çalışan
            </Badge>
          </div>

          <div className="rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-surface-container-low/80 hover:bg-surface-container-low/80">
                  <TableHead className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Ad</TableHead>
                  <TableHead className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Soyad</TableHead>
                  <TableHead className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Doğum Tarihi</TableHead>
                  <TableHead className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Departman</TableHead>
                  <TableHead className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">E-posta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.slice(0, 10).map((row, i) => (
                  <TableRow key={i} className="border-outline-variant/30">
                    <TableCell className="text-sm font-medium text-on-surface">{row.first_name}</TableCell>
                    <TableCell className="text-sm text-on-surface">{row.last_name}</TableCell>
                    <TableCell className="text-sm text-on-surface-variant">{row.date_of_birth}</TableCell>
                    <TableCell className="text-sm text-on-surface-variant">{row.department ?? "—"}</TableCell>
                    <TableCell className="text-sm text-on-surface-variant">{row.work_email ?? "—"}</TableCell>
                  </TableRow>
                ))}
                {preview.length > 10 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-xs text-on-surface-variant py-3 bg-surface-container-low/50">
                      ve {preview.length - 10} çalışan daha...
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <Button
            onClick={handleImport}
            disabled={isUploading || preview.length === 0}
            className="w-full rounded-xl gradient-primary text-white shadow-primary h-11"
            size="lg"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Yükleniyor...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {preview.length} Çalışanı İçe Aktar
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
