import { requireAuth, requireCompanyUser } from "@/lib/auth";
import { productService } from "@/lib/services/product.service";
import { NewOrderView } from "@/components/orders/new-order-view";
import type { ProductType } from "@/lib/shared";

export const metadata = {
  title: "Yeni Sipariş | CakeDay",
  description: "Hızlıca yeni bir pasta siparişi oluşturun.",
};

export default async function NewOrderPage() {
  const user = await requireAuth();
  requireCompanyUser(user);

  const productsWithPrices = await productService.listProducts();
  const productTypes = productsWithPrices.map(({ prices: _prices, ...rest }) => rest) as unknown as ProductType[];

  return <NewOrderView productTypes={productTypes} />;
}
