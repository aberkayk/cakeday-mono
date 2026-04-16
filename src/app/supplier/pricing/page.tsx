import { requireAuth } from "@/lib/auth";
import { productService } from "@/lib/services/product.service";
import { SupplierPricingClient } from "./_client";
import type { ProductType } from "@/lib/shared";

export const metadata = {
  title: "Fiyatlandırma | CakeDay",
  description: "Mevcut fiyatlar ve fiyat değişiklik talepleri.",
};

export default async function SupplierPricingPage() {
  await requireAuth();

  const productsWithPrices = await productService.listProducts();
  // Map to ProductType shape (strip prices for the prop)
  const productTypes = productsWithPrices.map(({ prices: _prices, ...rest }) => rest) as unknown as ProductType[];

  return <SupplierPricingClient productTypes={productTypes} />;
}
