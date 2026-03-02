"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function OrderConfirmedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100/50">
      <main className="container flex min-h-screen flex-col items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border-0 bg-white/80 p-10 shadow-[0_16px_48px_rgba(0,0,0,0.08)] backdrop-blur-sm text-center">
          <div className="mb-4 text-5xl">✅</div>
          <h1 className="mb-2 text-2xl font-semibold">ההזמנה התקבלה!</h1>
          <p className="mb-6 text-muted-foreground">
            נציג שלנו יצור איתך קשר בהקדם לאישור ולסידור המשלוח.
            {orderId && (
              <span className="mt-2 block text-sm">מזהה הזמנה: {orderId}</span>
            )}
          </p>
          <Link href="/">
            <Button>חזרה לקטלוג</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">טוען...</div>}>
      <OrderConfirmedContent />
    </Suspense>
  );
}
