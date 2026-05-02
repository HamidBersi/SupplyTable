import suppliers from "@/data/suppliers.json";
import products from "@/data/products.json";
import { SupplyCatalog } from "@/app/components/SupplyCatalog";
import type { Product, Supplier } from "@/types/supply";

export default function Home() {
  return (
    <SupplyCatalog
      suppliers={suppliers as Supplier[]}
      products={products as Product[]}
    />
  );
}
