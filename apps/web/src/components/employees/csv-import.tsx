"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, X, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
      <Card>
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="text-xl font-bold">İçe Aktarım Tamamlandı</h2>
          <div className="flex justify-center gap-6">
            <div>
              <p className="text-3xl font-bold text-green-600">{result.imported}</p>
              <p className="text-sm text-muted-foreground">Eklendi</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-600">{result.skipped}</p>
              <p className="text-sm text-muted-foreground">Atlandı</p>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="text-left rounded-md bg-destructive/10 p-3 space-y-1">
              {result.errors.map((e, i) => (
                <p key={i} className="text-xs text-destructive">{e}</p>
              ))}
            </div>
          )}
          <Button onClick={reset} variant="outline">
            Yeni Yükleme Yap
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          file && "border-green-400 bg-green-50"
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
          <div className="flex items-center justify-center gap-3">
            <FileText className="h-8 w-8 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {preview.length} çalışan hazır
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 ml-2"
              onClick={(e) => { e.stopPropagation(); reset(); }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium">CSV dosyanızı buraya sürükleyin</p>
            <p className="text-xs text-muted-foreground mt-1">veya tıklayarak seçin</p>
            <p className="text-xs text-muted-foreground mt-3">
              Desteklenen sütunlar: first_name, last_name, date_of_birth, department, work_email, district
            </p>
          </>
        )}
      </div>

      {/* Parse errors */}
      {parseErrors.length > 0 && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4 space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-sm font-medium text-destructive">Hatalı Satırlar</p>
          </div>
          {parseErrors.map((e, i) => (
            <p key={i} className="text-xs text-destructive">{e}</p>
          ))}
        </div>
      )}

      {/* Preview table */}
      {preview.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">
              Önizleme ({preview.length} çalışan)
            </h3>
            <Badge variant="secondary">{preview.length} satır</Badge>
          </div>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Ad</TableHead>
                  <TableHead>Soyad</TableHead>
                  <TableHead>Doğum Tarihi</TableHead>
                  <TableHead>Departman</TableHead>
                  <TableHead>E-posta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.slice(0, 10).map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm">{row.first_name}</TableCell>
                    <TableCell className="text-sm">{row.last_name}</TableCell>
                    <TableCell className="text-sm">{row.date_of_birth}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.department ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.work_email ?? "—"}</TableCell>
                  </TableRow>
                ))}
                {preview.length > 10 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-2">
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
            className="w-full"
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
