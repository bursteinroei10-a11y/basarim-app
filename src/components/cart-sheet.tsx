"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { useCutoffStatus } from "@/hooks/use-cutoff-status";
import { Beef } from "lucide-react";
import Link from "next/link";

export function CartSheet() {
  const { items, subtotal, serviceFee, totalAmount, totalItems, updateQuantity, removeItem, cartPulse } = useCartStore();
  const { locked } = useCutoffStatus();
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (cartPulse > 0) {
      setIsPulsing(true);
      const t = setTimeout(() => setIsPulsing(false), 700);
      return () => clearTimeout(t);
    }
  }, [cartPulse]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className={`gap-2 rounded-full border-0 shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-lg ${
            isPulsing
              ? "animate-cart-pop bg-amber-100 ring-2 ring-amber-400/60"
              : "bg-white/80"
          }`}
        >
          {isPulsing ? (
            <Beef className="size-5 text-amber-600 animate-pulse" />
          ) : (
            <span className="text-lg">🛒</span>
          )}
          <span>סל ({totalItems().toFixed(1)} ק״ג)</span>
          <span className="font-bold text-stone-800">₪{totalAmount().toLocaleString()}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full border-0 bg-white/95 backdrop-blur-2xl sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold">סל הקניות</SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-5">
          {items.length === 0 ? (
            <p className="py-12 text-center text-stone-500">הסל ריק</p>
          ) : (
            <>
              {locked && (
                <div className="rounded-xl bg-amber-50 p-3 text-center text-sm text-amber-800">
                  ההזמנות נסגרו. לא ניתן לערוך את הסל כעת.
                </div>
              )}
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between gap-3 rounded-xl bg-stone-50/80 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate text-stone-800">{item.nameHe}</p>
                    <p className="text-sm text-stone-500">
                      {item.quantityKg} ק״ג × ₪{item.pricePerKg} = ₪
                      {(item.quantityKg * item.pricePerKg).toLocaleString()}
                    </p>
                  </div>
                  {!locked && (
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.productId, item.quantityKg - 0.5)}
                      >
                        −
                      </Button>
                      <span className="min-w-[2.5rem] text-center text-sm font-medium">
                        {item.quantityKg}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.productId, item.quantityKg + 0.5)}
                      >
                        +
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-red-600 hover:bg-red-50"
                        onClick={() => removeItem(item.productId)}
                      >
                        ✕
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              <div className="rounded-xl bg-stone-100/80 p-4">
                {serviceFee() > 0 && (
                  <p className="text-sm text-stone-600">
                    שירות אריזה משלוח: ₪{serviceFee().toLocaleString()}
                    {serviceFee() === 30 ? " (מינ׳ ₪30)" : ""}
                  </p>
                )}
                <p className="text-lg font-bold text-stone-800">
                  סה״כ: ₪{totalAmount().toLocaleString()}
                </p>
                <Link href="/checkout">
                  <Button
                    className="mt-4 w-full rounded-full py-6 text-base font-semibold"
                    disabled={locked}
                  >
                    {locked ? "ההזמנות נסגרו" : "המשך לתשלום"}
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
