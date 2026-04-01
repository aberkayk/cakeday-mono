"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderForm } from "@/components/orders/order-form";
import { useOrders } from "@/hooks/use-orders";
import { useToast } from "@/hooks/use-toast";

export default function NewOrderPage() {
  const router = useRouter();
  const { createOrder } = useOrders();
  const { toast } = useToast();

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      await createOrder({ ...data, order_type: "ad_hoc" });
      toast({ title: "Sipariş oluşturuldu!" });
      router.push("/dashboard/orders");
    } catch (err) {
      toast({
        title: "Hata",
        description: err instanceof Error ? err.message : "Sipariş oluşturulamadı.",
        variant: "destructive",
      });
      throw err;
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/orders">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Yeni Sipariş</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manuel pasta siparişi oluşturun.
          </p>
        </div>
      </div>

      <OrderForm onSubmit={handleSubmit} />
    </div>
  );
}
