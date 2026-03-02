"use client";

import { useState } from "react";
import { Flame } from "lucide-react";

/** Custom grill cuts icon – short ribs / flat cuts on parchment.
 * Falls back to Flame Lucide icon if image missing. */
export function GrillIcon({ className }: { className?: string }) {
  const [error, setError] = useState(false);
  if (error)
    return <Flame className={className ?? "size-9 sm:size-10"} strokeWidth={1.5} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/icons/grill.png"
      alt="מנגל"
      width={80}
      height={80}
      className={`object-contain mix-blend-multiply ${className ?? "size-16 sm:size-20"}`}
      onError={() => setError(true)}
    />
  );
}
