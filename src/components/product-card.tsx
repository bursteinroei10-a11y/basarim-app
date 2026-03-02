"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart-store";
import { useCutoffStatus } from "@/hooks/use-cutoff-status";
import { getProductIcon } from "@/lib/product-icons";
import { Beef } from "lucide-react";

const QTY_OPTIONS = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5];

const IMAGE_ICONS = [
  "Entrecote", "GroundMeatImage", "Schnitzel", "Burger",
  "BeefImage", "GrillImage", "LambChopImage", "ChickenImage", "OffalImage", "SausageImage",
];

export interface ProductCardProduct {
  id: string;
  nameHe: string;
  descriptionHe: string | null;
  pricePerKg: number;
  imageUrl: string | null;
  iconName: string | null;
  requiresAdvanceOrder: boolean;
  category: { nameHe: string };
}

interface ProductCardProps {
  product: ProductCardProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { items, addItem, updateQuantity } = useCartStore();
  const { locked } = useCutoffStatus();
  const cartItem = items.find((i) => i.productId === product.id);
  const qty = cartItem?.quantityKg ?? 0;
  const [selectedQty, setSelectedQty] = useState<number | null>(null);
  const Icon = getProductIcon(product.iconName);

  const handleAddToCart = () => {
    const amount = selectedQty ?? 1; // default 1 kg if none selected
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
    <Card className="group flex overflow-hidden border-0 bg-white/70 backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all duration-200 hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)] hover:bg-white/85 rounded-xl">
      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
        <div className="flex items-start gap-4">
          <div className={`relative flex shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-600 ${
            IMAGE_ICONS.includes(product.iconName ?? "")
              ? "size-20 sm:size-24"
              : "size-16 sm:size-20"
          }`}>
            <Icon
              className={
                IMAGE_ICONS.includes(product.iconName ?? "")
                  ? "size-16 sm:size-20"
                  : "size-9 sm:size-10"
              }
              {...(!IMAGE_ICONS.includes(product.iconName ?? "") && { strokeWidth: 1.5 })}
            />
            {product.requiresAdvanceOrder && (
              <Badge className="absolute -top-1 -left-1 bg-amber-500/95 text-white border-0 text-[10px] px-1">
                יומיים
              </Badge>
            )}
          </div>
          <div className="min-w-0 flex-1 text-right">
            <p className="text-[10px] font-medium uppercase tracking-wider text-stone-400">
              {product.category.nameHe}
            </p>
            <h3 className="font-semibold leading-snug text-stone-800 text-sm sm:text-base">
              {product.nameHe}
            </h3>
            <p className="pt-1 text-base font-semibold text-stone-800">
              ₪{product.pricePerKg}
              <span className="text-xs font-normal text-stone-500"> / ק״ג</span>
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
          {qty > 0 ? (
            <div className="flex items-center gap-1 rounded-full bg-stone-100/80 py-0.5 px-2">
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
            <>
              <div className="flex flex-wrap gap-1.5">
                {QTY_OPTIONS.slice(0, 6).map((opt) => (
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
                className="h-8 gap-1.5 rounded-full bg-amber-600 px-4 text-xs font-medium hover:bg-amber-700"
                onClick={handleAddToCart}
              >
                <Beef className="size-3.5" />
                הוסף לסל
              </Button>
            </>
          )}
        </div>
        {product.descriptionHe && (
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-stone-500">
            {product.descriptionHe}
          </p>
        )}
      </div>
    </Card>
  );
}
