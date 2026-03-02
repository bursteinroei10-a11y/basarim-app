"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export function DeadlineBanner() {
  const [data, setData] = useState<{
    nextCutoffAt: string | null;
    cutoffAt: string | null;
  } | null>(null);

  useEffect(() => {
    fetch("/api/cutoff/status")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const at = data?.nextCutoffAt ?? data?.cutoffAt;
  if (!at) return null;

  const date = new Date(at);
  const formatted = date.toLocaleString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="flex items-center justify-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-3 text-amber-800"
      role="status"
    >
      <Clock className="size-4 shrink-0" aria-hidden />
      <p className="text-sm font-medium">
        תקופת ההזמנה הבאה תיסגר ב־{formatted}
      </p>
    </div>
  );
}
