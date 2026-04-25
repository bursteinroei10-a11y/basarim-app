"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCartStore } from "@/store/cart-store";
import { useCutoffStatus } from "@/hooks/use-cutoff-status";
import { MapPin } from "lucide-react";
import { PICKUP_ADDRESS, BALFOUR_ADDRESS, BALFOUR_PHONE } from "@/lib/config";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, serviceFee, totalAmount, totalItems, clearCart } = useCartStore();
  const { locked } = useCutoffStatus();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupLocation, setPickupLocation] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim()) {
      setError("נא למלא שם ואימייל");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (location: string) => {
    setError("");

    if (items.length === 0) {
      setError("הסל ריק. הוסף פריטים להזמנה.");
      return;
    }
    if (locked) {
      setError("ההזמנות נסגרו. לא ניתן לבצע הזמנה כעת.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          pickupLocation: location,
          items: items.map((i) => ({
            productId: i.productId,
            quantityKg: i.quantityKg,
            unitPrice: i.pricePerKg,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data.debug
          ? `${data.error}: ${data.debug}`
          : (data.error ?? "שגיאה ביצירת ההזמנה");
        throw new Error(errMsg);
      }

      clearCart();
      router.push(`/order-confirmed?id=${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה ביצירת ההזמנה");
      setLoading(false);
    }
  };

  if (items.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100/50">
        <Header />
        <main className="container flex min-h-[60vh] flex-col items-center justify-center px-4">
          <p className="text-lg text-stone-500">הסל ריק</p>
          <Button variant="link" onClick={() => router.push("/")} className="mt-2">
            חזרה לקטלוג
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100/50">
      <Header />
      <main className="container mx-auto max-w-lg px-4 py-10 sm:py-14">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-stone-800">
          השלמת הזמנה
        </h1>

        {/* Step indicator */}
        <div className="mb-8 flex items-center gap-3">
          <div className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${step === 1 ? "bg-amber-600 text-white" : "bg-amber-100 text-amber-700"}`}>1</div>
          <span className={`text-sm ${step === 1 ? "font-medium text-stone-800" : "text-stone-500"}`}>פרטים אישיים</span>
          <div className="h-px flex-1 bg-stone-200" />
          <div className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${step === 2 ? "bg-amber-600 text-white" : "bg-stone-200 text-stone-400"}`}>2</div>
          <span className={`text-sm ${step === 2 ? "font-medium text-stone-800" : "text-stone-400"}`}>נקודת איסוף</span>
        </div>

        {locked && (
          <div className="mb-6 rounded-xl bg-amber-50 p-4 text-center text-amber-800">
            ההזמנות נסגרו. לא ניתן לבצע הזמנה כעת. נציג יצור איתך קשר להזמנה הבאה.
          </div>
        )}

        {/* Order summary */}
        <div className="mb-8 rounded-2xl border-0 bg-white/70 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-sm">
          <h2 className="mb-3 font-medium">סיכום ההזמנה</h2>
          <ul className="space-y-2">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between text-sm">
                <span>
                  {i.nameHe} — {i.quantityKg} ק״ג
                </span>
                <span>₪{(i.quantityKg * i.pricePerKg).toLocaleString()}</span>
              </li>
            ))}
          </ul>
          {serviceFee() > 0 && (
            <p className="mt-3 text-sm text-stone-600">
              שירות אריזה משלוח: ₪{serviceFee().toLocaleString()}
              {serviceFee() === 30 ? " (מינ׳ ₪30)" : ""}
            </p>
          )}
          <p className="mt-4 border-t pt-4 font-bold">
            סה״כ: ₪{totalAmount().toLocaleString()} ({totalItems().toFixed(1)} ק״ג)
          </p>
        </div>

        {/* Step 1: Personal details */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-4">
            <div>
              <Label htmlFor="name">שם מלא *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="הכנס את שמך"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">אימייל *</Label>
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
            <div>
              <Label htmlFor="phone">טלפון</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="050-1234567"
                className="mt-1"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              className="w-full rounded-full py-6 text-base font-semibold"
              disabled={locked}
            >
              {locked ? "ההזמנות נסגרו" : "המשך לבחירת נקודת איסוף ←"}
            </Button>
          </form>
        )}

        {/* Step 2: Pickup location */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-stone-800">בחרו נקודת איסוף</h2>

            <button
              type="button"
              onClick={() => handleSubmit(PICKUP_ADDRESS)}
              disabled={loading}
              className="w-full rounded-2xl border-2 border-transparent bg-white/80 p-5 text-right shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all hover:border-amber-400 hover:shadow-md disabled:opacity-60"
            >
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-amber-600" />
                <div>
                  <p className="font-semibold text-stone-800">{PICKUP_ADDRESS}</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(BALFOUR_ADDRESS)}
              disabled={loading}
              className="w-full rounded-2xl border-2 border-transparent bg-white/80 p-5 text-right shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all hover:border-amber-400 hover:shadow-md disabled:opacity-60"
            >
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-amber-600" />
                <div>
                  <p className="font-semibold text-stone-800">{BALFOUR_ADDRESS}</p>
                  <p className="mt-0.5 text-sm text-stone-500">{BALFOUR_PHONE}</p>
                </div>
              </div>
            </button>

            {error && (
              <div className="space-y-2">
                <p className="text-sm text-destructive">{error}</p>
                {error.includes("לרוקן את הסל") && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      clearCart();
                      setError("");
                      router.push("/");
                    }}
                  >
                    רוקן סל וחזור לקטלוג
                  </Button>
                )}
              </div>
            )}

            {loading && (
              <p className="text-center text-sm text-stone-500">שולח הזמנה...</p>
            )}

            <button
              type="button"
              onClick={() => { setStep(1); setError(""); }}
              className="w-full text-center text-sm text-stone-400 hover:text-stone-600"
            >
              → חזרה לפרטים אישיים
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
