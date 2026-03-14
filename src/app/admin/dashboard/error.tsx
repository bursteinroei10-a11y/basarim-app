"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="space-y-6 rounded-2xl border border-amber-200 bg-amber-50/50 p-8">
      <h2 className="text-xl font-semibold text-amber-900">שגיאה בטעינת לוח הבקרה</h2>
      <p className="text-sm text-amber-800">
        ייתכן שהמסד נתונים לא מעודכן. הרץ <code className="rounded bg-amber-100 px-1">npx prisma db push</code> עם
        ה-DATABASE_URL של האתר החי.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          נסה שוב
        </button>
        <Link
          href="/admin"
          className="rounded-lg border border-amber-600 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100"
        >
          חזרה להזמנות
        </Link>
      </div>
    </div>
  );
}
