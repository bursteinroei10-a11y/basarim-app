"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { calculateOrderTotal } from "@/lib/order-fees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

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
  imageUrl: string | null;
  category: { nameHe: string };
}

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  const email = searchParams.get("email") ?? "";

  const [items, setItems] = useState<EditItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editable, setEditable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [addProductId, setAddProductId] = useState("");

  useEffect(() => {
    if (!orderId || !email) {
      router.push("/my-orders");
      return;
    }
    Promise.all([
      fetch(`/api/orders/${orderId}?email=${encodeURIComponent(email)}`).then((r) =>
        r.json()
      ),
      fetch("/api/products").then((r) => r.json()),
    ]).then(([orderRes, productsRes]) => {
      if (orderRes.error || orderRes.statusCode) {
        setError(orderRes.error ?? "הזמנה לא נמצאה");
        setLoading(false);
        return;
      }
      setItems(
        orderRes.items.map((i: { meatProduct: { id: string; nameHe: string; pricePerKg: number }; quantityKg: number }) => ({
          productId: i.meatProduct.id,
          nameHe: i.meatProduct.nameHe,
          pricePerKg: i.meatProduct.pricePerKg,
          quantityKg: i.quantityKg,
        }))
      );
      setEditable(orderRes.editable ?? false);
      setProducts(Array.isArray(productsRes) ? productsRes : []);
      setLoading(false);
    });
  }, [orderId, email, router]);

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
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
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
      router.replace(`/my-orders?email=${encodeURIComponent(email)}&updated=1`);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100/50">
        <Header />
        <main className="container mx-auto max-w-lg px-4 py-10 sm:py-14">
          <p className="text-center text-stone-500">טוען...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100/50">
      <Header />
      <main className="container mx-auto max-w-lg px-4 py-10 sm:py-14">
        <Link
          href={`/my-orders?email=${encodeURIComponent(email)}`}
          className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← חזרה להזמנות שלי
        </Link>

        <h1 className="mb-8 text-3xl font-bold tracking-tight text-stone-800">
          עריכת הזמנה
        </h1>

        {!editable ? (
          <div className="rounded-xl bg-amber-50 p-6 text-center text-amber-800">
            <p className="font-medium">ההזמנות נסגרו</p>
            <p className="mt-2 text-sm">
              לא ניתן לערוך הזמנות לאחר מועד הסגירה. נציג יצור איתך קשר להזמנה הבאה.
            </p>
            <Button asChild variant="secondary" className="mt-4">
              <Link href={`/my-orders?email=${encodeURIComponent(email)}`}>
                חזרה להזמנות
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-8 space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white/80 p-4 backdrop-blur-sm"
                >
                  <div>
                    <p className="font-medium">{item.nameHe}</p>
                    <p className="text-sm text-muted-foreground">
                      ₪{item.pricePerKg} לק״ג
                    </p>
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
              <div className="mb-8">
                <Label className="mb-2 block">הוסף מוצר</Label>
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

            <div className="mb-6 rounded-xl border bg-white/80 p-4 backdrop-blur-sm">
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
              <p className="mb-4 text-sm text-destructive">{error}</p>
            )}

            <Button
              className="w-full py-6"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "שומר..." : "שמור שינויים"}
            </Button>
          </>
        )}
      </main>
    </div>
  );
}
