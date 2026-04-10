"use client";

import { Settings, Shield, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Sistem Ayarları</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform geneli konfigürasyon ve güvenlik ayarları.</p>
      </div>

      <Card className="border border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            Platform Ayarları
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Sipariş Teslim Süresi (gün)</Label>
            <Input type="number" defaultValue={3} className="w-32" />
            <p className="text-xs text-muted-foreground">Siparişin oluşturulmasından teslimat tarihine kadar minimum süre.</p>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Sipariş Kabul Süresi (saat)</Label>
            <Input type="number" defaultValue={2} className="w-32" />
            <p className="text-xs text-muted-foreground">Pastane siparişi bu süre içinde kabul etmeli.</p>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>İptal Kesintisi (%)</Label>
            <Input type="number" defaultValue={10} className="w-32" />
            <p className="text-xs text-muted-foreground">Son dakika iptali için uygulanan kesinti oranı.</p>
          </div>
          <Button>Kaydet</Button>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            Bildirim Ayarları
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Sistem Bildirim E-postası</Label>
            <Input type="email" defaultValue="alerts@cakeday.com" />
          </div>
          <div className="space-y-2">
            <Label>Operasyon E-postası</Label>
            <Input type="email" defaultValue="ops@cakeday.com" />
          </div>
          <Button>Kaydet</Button>
        </CardContent>
      </Card>

      <Card className="border border-orange-200 bg-orange-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-orange-800">
            <Shield className="h-5 w-5" />
            Tehlikeli Bölge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-orange-700">Bu işlemler geri alınamaz. Dikkatli olun.</p>
          <div className="flex gap-3">
            <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
              Test Verilerini Temizle
            </Button>
            <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
              Önbelleği Temizle
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
