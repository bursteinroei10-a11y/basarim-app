"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart-store";
import { useCutoffStatus } from "@/hooks/use-cutoff-status";
import { getProductIcon } from "@/lib/product-icons";
import { Beef } from "lucide-react";
import type { ProductCardProduct } from "@/components/product-card";

const QTY_OPTIONS = [0.5, 1, 1.5, 2, 2.5, 3];

interface BestSellerCardProps {
  product: ProductCardProduct;
}

export function BestSellerCard({ product }: BestSellerCardProps) {
  const { items, addItem, updateQuantity } = useCartStore();
  const { locked } = useCutoffStatus();
  const cartItem = items.find((i) => i.productId === product.id);
  const qty = cartItem?.quantityKg ?? 0;
  const [selectedQty, setSelectedQty] = useState<number | null>(null);
  const Icon = getProductIcon(product.iconName);

  // Check if it's a local/real photo (not an icon placeholder)
  const hasPhoto = product.imageUrl && (
    product.imageUrl.startsWith("/images/products/") ||
    product.imageUrl.startsWith("https://")
  );

  const handleAddToCart = () => {
    const amount = selectedQty ?? 1;
    addItem({
      productId: product.id,
      nameHe: product.nameHe,
      pricePerKg: product.pricePerKg,
      imageUrl: product.imageUrl ?? undefined,
      quantityKg: amount,
    });
    setSelectedQty(null);
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border-0 bg-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.07)] backdrop-blur-xl transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:bg-white/95">
      {/* Photo / Icon area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        {hasPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl!}
            alt={product.nameHe}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // Hide broken image, show icon fallback
              (e.target as HTMLImageElement).style.display = "none";
              const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = "flex";
            }}
          />
        ) : null}
        {/* Icon fallback */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-stone-100"
          style={{ display: hasPhoto ? "none" : "flex" }}
        >
          <Icon className="size-20 text-stone-400" />
        </div>
        {product.requiresAdvanceOrder && (
          <Badge className="absolute top-2 right-2 bg-amber-500/95 text-white border-0 text-xs">
            הזמנה יומיים מראש
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 text-right">
        <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-stone-400">
          {product.category.nameHe}
        </p>
        <h3 className="mb-1 text-base font-bold leading-snug text-stone-800">
          {product.nameHe}
        </h3>
        <p className="mb-3 text-lg font-bold text-stone-800">
          ₪{product.pricePerKg}
          <span className="text-sm font-normal text-stone-500"> / ק״ג</span>
        </p>

        {qty > 0 ? (
          <div className="flex items-center gap-1 self-end rounded-full bg-stone-100/80 py-0.5 px-2">
            {!locked && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full hover:bg-white/80 text-xs"
                onClick={() => updateQuantity(product.id, qty - 0.5)}
              >
                −
              </Button>
            )}
            <span className="min-w-[2.5rem] text-center text-sm font-medium text-stone-800">
              {qty} ק״ג
            </span>
            {!locked && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full hover:bg-white/80 text-xs"
                onClick={() => updateQuantity(product.id, qty + 0.5)}
              >
                +
              </Button>
            )}
          </div>
        ) : locked ? (
          <p className="text-xs text-amber-600">ההזמנות נסגרו</p>
        ) : (
          <div className="mt-auto space-y-2">
            <div className="flex flex-wrap gap-1.5 justify-end">
              {QTY_OPTIONS.map((opt) => (
                <Button
                  key={opt}
                  variant={selectedQty === opt ? "default" : "secondary"}
                  size="sm"
                  className="h-7 rounded-full px-3 text-xs font-medium"
                  onClick={() => setSelectedQty(opt)}
                >
                  {opt} ק״ג
                </Button>
              ))}
            </div>
            <Button
              size="sm"
              className="w-full h-9 gap-1.5 rounded-full bg-amber-600 text-sm font-semibold hover:bg-amber-700"
              onClick={handleAddToCart}
            >
              <Beef className="size-4" />
              הוסף לסל
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
