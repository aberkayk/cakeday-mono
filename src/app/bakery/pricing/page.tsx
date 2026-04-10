import { requireAuth } from "@/lib/auth";
import { cakeService } from "@/lib/services/cake.service";
import { BakeryPricingClient } from "./_client";
import type { CakeType } from "@/lib/shared";

export const metadata = {
  title: "Fiyatlandırma | CakeDay",
  description: "Mevcut fiyatlar ve fiyat değişiklik talepleri.",
};

export default async function BakeryPricingPage() {
  await requireAuth();

  const cakesWithPrices = await cakeService.listCakes();
  // Map to CakeType shape (strip prices for the prop)
  const cakeTypes = cakesWithPrices.map(({ prices: _prices, ...rest }) => rest) as unknown as CakeType[];

  return <BakeryPricingClient cakeTypes={cakeTypes} />;
}
