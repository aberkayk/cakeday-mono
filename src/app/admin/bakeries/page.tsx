"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronRight, ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, BAKERY_STATUS_LABELS } from "@/lib/utils";
import type { Bakery } from "@/lib/shared";

// TODO: wire to server actions

const STATUS_COLORS: Record<string, string> = {
  pending_setup: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  suspended: "bg-red-100 text-red-800",
};

export default function BakeriesPage() {
  const [bakeries] = useState<Bakery[]>([]);
  const [totalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const pageSize = 20;

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pastaneler</h1>
          <p className="text-muted-foreground text-sm mt-1">Partner pastaneler ve durumları.</p>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1">{totalCount} pastane</Badge>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Pastane adı veya slug..." className="pl-9" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <Card className="border border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Pastane</TableHead>
                <TableHead>İletişim</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Kayıt Tarihi</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bakeries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground text-sm">
                    Pastane bulunamadı.
                  </TableCell>
                </TableRow>
              ) : (
                bakeries.map((bakery) => (
                  <TableRow key={bakery.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{bakery.name}</p>
                        <p className="text-xs text-muted-foreground">/{bakery.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <p>{bakery.contact_name}</p>
                      <p className="text-xs text-muted-foreground">{bakery.contact_email}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${STATUS_COLORS[bakery.status] ?? ""}`}>
                        {BAKERY_STATUS_LABELS[bakery.status] ?? bakery.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(bakery.created_at)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link href={`/admin/bakeries/${bakery.id}`}><ChevronRight className="h-4 w-4" /></Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Toplam {totalCount} pastane</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
