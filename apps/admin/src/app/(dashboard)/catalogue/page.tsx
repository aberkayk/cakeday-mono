"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { adminApi } from "@/lib/api";
import type { CakeType } from "@cakeday/shared";

const schema = z.object({
  name: z.string().min(1, "Ad gerekli."),
  slug: z.string().min(1, "Slug gerekli.").regex(/^[a-z0-9-]+$/, "Sadece küçük harf, rakam ve tire."),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function CataloguePage() {
  const [cakeTypes, setCakeTypes] = useState<CakeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CakeType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CakeType | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const fetchCatalogue = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.catalogue();
      setCakeTypes(res.data);
    } catch { } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchCatalogue(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    reset({ name: "", slug: "", description: "" });
    setFormOpen(true);
  };

  const openEdit = (cake: CakeType) => {
    setEditTarget(cake);
    reset({ name: cake.name, slug: cake.slug, description: cake.description ?? "" });
    setFormOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (editTarget) {
        await adminApi.updateCakeType(editTarget.id, data);
      } else {
        await adminApi.createCakeType({ ...data, is_active: true });
      }
      setFormOpen(false);
      fetchCatalogue();
    } catch (err) {
      alert(err instanceof Error ? err.message : "İşlem başarısız.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.deleteCakeType(deleteTarget.id);
      setDeleteTarget(null);
      fetchCatalogue();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Silme başarısız.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pasta Kataloğu</h1>
          <p className="text-muted-foreground text-sm mt-1">Platformdaki pasta türlerini yönetin.</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Yeni Pasta Türü</Button>
      </div>

      <Card className="border border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Pasta Adı</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Özellikler</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(5)].map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}
                  </TableRow>
                ))
              ) : cakeTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground text-sm">
                    Katalog boş. Yeni pasta türü ekleyin.
                  </TableCell>
                </TableRow>
              ) : (
                cakeTypes.map((cake) => (
                  <TableRow key={cake.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🎂</span>
                        <div>
                          <p className="font-medium text-sm">{cake.name}</p>
                          {cake.description && <p className="text-xs text-muted-foreground truncate max-w-xs">{cake.description}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{cake.slug}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {cake.is_gluten_free && <Badge variant="secondary" className="text-xs">GF</Badge>}
                        {cake.is_vegan && <Badge variant="secondary" className="text-xs">Vegan</Badge>}
                        {cake.is_seasonal && <Badge variant="warning" className="text-xs">Sezonluk</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={cake.is_active ? "success" : "secondary"} className={cake.is_active ? "bg-green-100 text-green-800" : ""}>
                        {cake.is_active ? "Aktif" : "Pasif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cake)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(cake)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Pasta Türünü Düzenle" : "Yeni Pasta Türü"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad *</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input id="slug" placeholder="cikolatali-pasta" {...register("slug")} />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea id="description" rows={2} {...register("description")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>İptal</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editTarget ? "Güncelle" : "Ekle"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Pasta Türünü Sil</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            <strong>{deleteTarget?.name}</strong> pasta türünü silmek istediğinizden emin misiniz?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>İptal</Button>
            <Button variant="destructive" onClick={handleDelete}>Sil</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
