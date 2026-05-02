import { BestSellerCard } from "@/components/best-seller-card";
import type { ProductCardProduct } from "@/components/product-card";

interface BestSellersProps {
  products: ProductCardProduct[];
}

export function BestSellers({ products }: BestSellersProps) {
  if (products.length === 0) return null;

  return (
    <section className="scroll-mt-24" id="best-sellers">
      <h2 className="mb-6 text-2xl font-bold text-stone-800 sm:text-3xl">
        הנמכרים והמומלצים ביותר
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {products.map((product) => (
          <BestSellerCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
