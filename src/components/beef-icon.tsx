"use client";

import { useState } from "react";
import { Beef } from "lucide-react";

/** Custom beef cuts icon – steak on parchment.
 * Falls back to Beef Lucide icon if image missing. */
export function BeefIcon({ className }: { className?: string }) {
  const [error, setError] = useState(false);
  if (error)
    return <Beef className={className ?? "size-9 sm:size-10"} strokeWidth={1.5} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/icons/beef.png"
      alt="בקר"
      width={80}
      height={80}
      className={`object-contain mix-blend-multiply ${className ?? "size-16 sm:size-20"}`}
      onError={() => setError(true)}
    />
  );
}
