import { OrdersView } from "@/components/orders/orders-view";

export const metadata = {
  title: "Siparişlerim | CakeDay",
  description: "Tüm siparişlerinizi ve durumlarını takip edin.",
};

export default function OrdersPage() {
  return <OrdersView />;
}
