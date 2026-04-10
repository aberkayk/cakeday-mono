import { requireAuth, requireCompanyUser } from "@/lib/auth";
import { cakeService } from "@/lib/services/cake.service";
import { NewOrderView } from "@/components/orders/new-order-view";
import type { CakeType } from "@/lib/shared";

export const metadata = {
  title: "Yeni Sipariş | CakeDay",
  description: "Hızlıca yeni bir pasta siparişi oluşturun.",
};

export default async function NewOrderPage() {
  const user = await requireAuth();
  requireCompanyUser(user);

  const cakesWithPrices = await cakeService.listCakes();
  const cakeTypes: CakeType[] = cakesWithPrices.map(({ prices: _prices, ...rest }) => rest);

  return <NewOrderView cakeTypes={cakeTypes} />;
}
