import { ProductCard, type ProductCardProduct } from "@/components/product-card";

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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
