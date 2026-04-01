"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { adminApi } from "@/lib/api";
import { formatDate, formatCurrency } from "@/lib/utils";

const CAKE_SIZE_LABELS: Record<string, string> = { small: "Küçük", medium: "Orta", large: "Büyük" };
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};
const STATUS_LABELS: Record<string, string> = {
  pending: "Bekliyor",
  approved: "Onaylandı",
  rejected: "Reddedildi",
};

type PricingRequest = {
  id: string;
  bakery_id: string;
  cake_type_id: string;
  size: string;
  current_price_try: number;
  requested_price_try: number;
  status: string;
  justification: string | null;
  created_at: string;
};

export default function PricingRequestsPage() {
  const [requests, setRequests] = useState<PricingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState<PricingRequest | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.pricingRequests({ pageSize: 50 });
      setRequests(res.data);
    } catch { } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleApprove = async (id: string) => {
    try {
      await adminApi.approvePricingRequest(id);
      fetchRequests();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Onaylama başarısız.");
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    try {
      await adminApi.rejectPricingRequest(rejectTarget.id, rejectNote);
      setRejectTarget(null);
      setRejectNote("");
      fetchRequests();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Reddetme başarısız.");
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const processedRequests = requests.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fiyat Değişiklik Talepleri</h1>
          <p className="text-muted-foreground text-sm mt-1">Pastanelerden gelen fiyat değişiklik talepleri.</p>
        </div>
        {pendingRequests.length > 0 && (
          <Badge className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1">
            {pendingRequests.length} bekleyen talep
          </Badge>
        )}
      </div>

      {pendingRequests.length > 0 && (
        <div>
          <h2 className="text-base font-semibold mb-3">Bekleyen Talepler</h2>
          <Card className="border border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Pastane ID</TableHead>
                    <TableHead>Pasta / Boyut</TableHead>
                    <TableHead>Mevcut</TableHead>
                    <TableHead>Talep Edilen</TableHead>
                    <TableHead>Gerekçe</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(3)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(7)].map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}
                      </TableRow>
                    ))
                  ) : (
                    pendingRequests.map((req) => (
                      <TableRow key={req.id} className="hover:bg-muted/20">
                        <TableCell className="font-mono text-xs">{req.bakery_id.slice(0, 8)}</TableCell>
                        <TableCell className="text-sm">
                          <span className="font-mono text-xs text-muted-foreground">{req.cake_type_id.slice(0, 8)}</span>
                          <p className="text-xs">{CAKE_SIZE_LABELS[req.size] ?? req.size}</p>
                        </TableCell>
                        <TableCell className="text-sm">{formatCurrency(req.current_price_try)}</TableCell>
                        <TableCell className="text-sm font-semibold text-green-700">{formatCurrency(req.requested_price_try)}</TableCell>
                        <TableCell className="text-sm max-w-xs">
                          <p className="truncate text-muted-foreground">{req.justification ?? "—"}</p>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(req.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button size="sm" className="h-7 text-xs" onClick={() => handleApprove(req.id)}>
                              <CheckCircle className="mr-1 h-3.5 w-3.5" />Onayla
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs text-destructive border-destructive/30" onClick={() => setRejectTarget(req)}>
                              <XCircle className="mr-1 h-3.5 w-3.5" />Reddet
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {processedRequests.length > 0 && (
        <div>
          <h2 className="text-base font-semibold mb-3">İşlenen Talepler</h2>
          <Card className="border border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Pastane ID</TableHead>
                    <TableHead>Boyut</TableHead>
                    <TableHead>Talep Edilen</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Tarih</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedRequests.map((req) => (
                    <TableRow key={req.id} className="hover:bg-muted/20">
                      <TableCell className="font-mono text-xs">{req.bakery_id.slice(0, 8)}</TableCell>
                      <TableCell className="text-sm">{CAKE_SIZE_LABELS[req.size] ?? req.size}</TableCell>
                      <TableCell className="text-sm">{formatCurrency(req.requested_price_try)}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${STATUS_COLORS[req.status] ?? ""}`}>
                          {STATUS_LABELS[req.status] ?? req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(req.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {!isLoading && requests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground">Henüz fiyat talebi yok.</p>
        </div>
      )}

      <Dialog open={!!rejectTarget} onOpenChange={() => setRejectTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Talebi Reddet</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Bu fiyat değişiklik talebini reddetmek üzeresiniz.</p>
            <div className="space-y-2">
              <Label>Red Nedeni</Label>
              <Textarea placeholder="Red gerekçesini yazın..." value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>İptal</Button>
            <Button variant="destructive" onClick={handleReject}>Reddet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
