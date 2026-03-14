"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { calculateOrderTotal } from "@/lib/order-fees";
import { Button } from "@/components/ui/button";

const STEP = 0.5;
const MIN_QTY = 0.5;

type EditItem = {
  productId: string;
  nameHe: string;
  pricePerKg: number;
  quantityKg: number;
};

interface Product {
  id: string;
  nameHe: string;
  pricePerKg: number;
  category: { nameHe: string };
}

interface AdminOrderEditFormProps {
  orderId: string;
  initialItems: { meatProduct: { id: string; nameHe: string; pricePerKg: number }; quantityKg: number }[];
  canEdit: boolean; // false when status is DELIVERED
  products: Product[];
}

export function AdminOrderEditForm({
  orderId,
  initialItems,
  canEdit,
  products,
}: AdminOrderEditFormProps) {
  const router = useRouter();
  const [items, setItems] = useState<EditItem[]>(() =>
    initialItems.map((i) => ({
      productId: i.meatProduct.id,
      nameHe: i.meatProduct.nameHe,
      pricePerKg: i.meatProduct.pricePerKg,
      quantityKg: i.quantityKg,
    }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [addProductId, setAddProductId] = useState("");

  const roundQty = (n: number) => Math.round(n / STEP) * STEP;

  const updateQty = (productId: string, delta: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? { ...i, quantityKg: Math.max(MIN_QTY, roundQty(i.quantityKg + delta)) }
          : i
      )
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const addItem = () => {
    if (!addProductId) return;
    const prod = products.find((p) => p.id === addProductId);
    if (!prod) return;
    const existing = items.find((i) => i.productId === addProductId);
    if (existing) {
      updateQty(addProductId, STEP);
    } else {
      setItems((prev) => [
        ...prev,
        {
          productId: prod.id,
          nameHe: prod.nameHe,
          pricePerKg: prod.pricePerKg,
          quantityKg: MIN_QTY,
        },
      ]);
    }
    setAddProductId("");
  };

  const handleSave = async () => {
    if (items.length === 0) {
      setError("יש להשאיר לפחות פריט אחד בהזמנה");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/admin/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantityKg: i.quantityKg,
            unitPrice: i.pricePerKg,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "שגיאה בשמירה");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  const subtotal = items.reduce(
    (sum, i) => sum + i.quantityKg * i.pricePerKg,
    0
  );
  const { serviceFee, total: totalAmount } = calculateOrderTotal(subtotal);
  const totalKg = items.reduce((sum, i) => sum + i.quantityKg, 0);

  if (!canEdit) {
    return null;
  }

  return (
    <div className="mt-6 rounded-xl border border-amber-200/60 bg-amber-50/30 p-6">
      <h3 className="mb-4 font-semibold">עריכת פריטים</h3>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-3"
          >
            <div>
              <p className="font-medium">{item.nameHe}</p>
              <p className="text-sm text-muted-foreground">₪{item.pricePerKg} לק״ג</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateQty(item.productId, -STEP)}
                disabled={item.quantityKg <= MIN_QTY}
              >
                −
              </Button>
              <span className="min-w-[3ch] text-center font-medium">
                {item.quantityKg} ק״ג
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateQty(item.productId, STEP)}
              >
                +
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => removeItem(item.productId)}
                disabled={items.length <= 1}
              >
                הסר
              </Button>
            </div>
            <p className="w-full text-left font-medium sm:w-auto">
              ₪{Math.round(item.quantityKg * item.pricePerKg).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {products.length > 0 && (
        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium">הוסף מוצר</label>
          <div className="flex gap-2">
            <select
              value={addProductId}
              onChange={(e) => setAddProductId(e.target.value)}
              className="flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              <option value="">בחר מוצר...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nameHe} — ₪{p.pricePerKg}/ק״ג
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="secondary"
              onClick={addItem}
              disabled={!addProductId}
            >
              הוסף
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4 rounded-lg border bg-white p-4">
        {serviceFee > 0 && (
          <p className="text-sm text-stone-600">
            שירות אריזה משלוח: ₪{serviceFee.toLocaleString()}
            {serviceFee === 30 ? " (מינ׳ ₪30)" : ""}
          </p>
        )}
        <p className="text-lg font-bold">
          סה״כ: ₪{totalAmount.toLocaleString()} ({totalKg.toFixed(1)} ק״ג)
        </p>
      </div>

      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}

      <Button
        className="mt-4"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "שומר..." : "שמור שינויים"}
      </Button>
    </div>
  );
}
