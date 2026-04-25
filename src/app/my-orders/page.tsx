"use client";

import { useState, useEffect, Suspense } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCartStore } from "@/store/cart-store";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MapPin } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין",
  RECEIVED: "התקבל",
  AWAITING_PAYMENT: "ממתין לתשלום",
  PAID: "שולם",
  DELIVERED: "נמסר",
};

interface OrderItem {
  id: string;
  quantityKg: number;
  unitPrice: number;
  lineTotal: number;
  meatProduct: { id: string; nameHe: string; pricePerKg: number; imageUrl: string | null };
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  pickupLocation?: string | null;
  items: OrderItem[];
  lastEditedBy?: string;
  lastEditedAt?: string;
}

function MyOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addItem = useCartStore((s) => s.addItem);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ orders: Order[]; name: string | null } | null>(null);
  const [error, setError] = useState("");
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const q = searchParams.get("email");
    if (q) {
      setEmail(q);
    }
  }, [searchParams]);

  useEffect(() => {
    const q = searchParams.get("email")?.trim().toLowerCase();
    if (q && searchParams.get("updated") === "1" && !data) {
      setLoading(true);
      fetch(`/api/orders/by-email?email=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((json) => {
          if (!json.error) setData(json);
        })
        .finally(() => setLoading(false));
      router.replace("/my-orders?email=" + encodeURIComponent(q), { scroll: false });
    }
  }, [searchParams, router, data]);

  useEffect(() => {
    fetch("/api/cutoff/status")
      .then((r) => r.json())
      .then((d) => setLocked(d.locked ?? false))
      .catch(() => setLocked(false));
  }, []);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/by-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "שגיאה");
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReOrder = (order: Order) => {
    order.items.forEach((item) => {
      addItem({
        productId: item.meatProduct.id,
        nameHe: item.meatProduct.nameHe,
        pricePerKg: item.meatProduct.pricePerKg,
        imageUrl: item.meatProduct.imageUrl ?? undefined,
        quantityKg: item.quantityKg,
      });
    });
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100/50">
      <Header />
      <main className="container mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-stone-800">
          ההזמנות שלי
        </h1>
        <p className="mb-6 text-stone-600">
          הזינו את האימייל שבו השתמשתם בהזמנה כדי לראות את היסטוריית ההזמנות.
        </p>

        <form onSubmit={handleLookup} className="mb-10 space-y-4">
          <div>
            <Label htmlFor="email">אימייל</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              className="mt-1"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "מחפש..." : "הצג הזמנות"}
          </Button>
        </form>

        {data && (
          <div className="space-y-6">
            {data.name && (
              <p className="text-lg font-medium text-stone-700">שלום {data.name}!</p>
            )}
            {data.orders.length === 0 ? (
              <p className="text-stone-500">לא נמצאו הזמנות לאימייל זה.</p>
            ) : (
              <ul className="space-y-4">
                {data.orders.map((order) => (
                  <li
                    key={order.id}
                    className="rounded-2xl border bg-white/80 p-5 shadow-sm backdrop-blur-sm"
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm text-stone-500">
                        {new Date(order.createdAt).toLocaleDateString("he-IL", {
                          dateStyle: "long",
                        })}
                      </span>
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-medium">
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </div>
                    <ul className="mb-4 space-y-1 text-sm">
                      {order.items.slice(0, 3).map((item) => (
                        <li key={item.id}>
                          {item.meatProduct.nameHe} — {item.quantityKg} ק״ג
                        </li>
                      ))}
                      {order.items.length > 3 && (
                        <li className="text-stone-500">+{order.items.length - 3} פריטים</li>
                      )}
                    </ul>
                    {order.pickupLocation && (
                      <div className="mb-3 flex items-center gap-1.5 text-sm text-stone-600">
                        <MapPin className="size-3.5 shrink-0 text-amber-600" />
                        <span>נקודת איסוף: <strong>{order.pickupLocation}</strong></span>
                      </div>
                    )}
                    <p className="mb-4 font-bold">₪{order.totalAmount.toLocaleString()}</p>
                    {order.lastEditedAt && (
                      <p className="mb-3 text-xs text-muted-foreground">
                        עדכון אחרון: {order.lastEditedBy === "admin" ? "מנהל" : "לקוח"} •{" "}
                        {new Date(order.lastEditedAt).toLocaleDateString("he-IL", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {!locked && (
                        <Button variant="default" size="sm" asChild>
                          <Link
                            href={`/my-orders/${order.id}/edit?email=${encodeURIComponent(email.trim().toLowerCase())}`}
                          >
                            שנה הזמנה
                          </Link>
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleReOrder(order)}
                      >
                        הזמן שוב
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function MyOrdersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100/50">
        <Header />
        <main className="container mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-20">
          <p className="text-stone-500">טוען...</p>
        </main>
      </div>
    }>
      <MyOrdersContent />
    </Suspense>
  );
}
