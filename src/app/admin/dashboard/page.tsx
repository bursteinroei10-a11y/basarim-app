"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Batch {
  cutoffAt: string;
  label: string;
  orderCount: number;
  totalPaid: number;
  totalEarned: number;
}

interface RepeatBuyer {
  userId: string;
  email: string;
  name: string | null;
  orderCount: number;
}

interface DashboardData {
  totalPaid: number;
  totalEarned: number;
  orderCount: number;
  byBatch: Batch[];
  repeatBuyers: RepeatBuyer[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/admin/api/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("שגיאה בטעינה");
        return res.json();
      })
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setData(json);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "שגיאה"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-semibold">לוח בקרה</h1>
        <p className="text-muted-foreground">טוען...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 rounded-2xl border border-amber-200 bg-amber-50/50 p-8">
        <h2 className="text-xl font-semibold text-amber-900">שגיאה בטעינת לוח הבקרה</h2>
        <p className="text-sm text-amber-800">{error}</p>
        <Link
          href="/admin"
          className="inline-block rounded-lg border border-amber-600 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100"
        >
          חזרה להזמנות
        </Link>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">לוח בקרה</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          נתונים לפי הזמנות שנמסרו בלבד
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">סה״כ שנגבה</h3>
          <p className="mt-2 text-3xl font-bold">₪{data.totalPaid.toLocaleString()}</p>
          <p className="mt-1 text-sm text-stone-500">{data.orderCount} הזמנות</p>
        </div>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">הרווח שלך (12% / ₪30)</h3>
          <p className="mt-2 text-3xl font-bold text-green-700">₪{data.totalEarned.toLocaleString()}</p>
        </div>
      </div>

      {data.byBatch.length > 0 && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">לפי משלוח (תאריך סגירה)</h3>
          <div className="space-y-3">
            {data.byBatch.map((b) => (
              <div
                key={b.cutoffAt}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4"
              >
                <div>
                  <p className="font-medium">{b.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {b.orderCount} הזמנות • סה״כ ₪{b.totalPaid.toLocaleString()} • רווח ₪{b.totalEarned.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold">לקוחות חוזרים (2+ הזמנות)</h3>
        {data.repeatBuyers.length === 0 ? (
          <p className="text-muted-foreground">אין לקוחות חוזרים עדיין</p>
        ) : (
          <ul className="space-y-2">
            {data.repeatBuyers.map((r) => (
              <li
                key={r.userId}
                className="flex items-center justify-between rounded-lg border px-4 py-2"
              >
                <span className="font-medium">{r.name ?? r.email}</span>
                <span className="text-sm text-muted-foreground">{r.orderCount} הזמנות</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link href="/admin" className="inline-block text-sm text-muted-foreground hover:text-foreground">
        ← חזרה להזמנות
      </Link>
    </div>
  );
}
