"use client";

import { useState } from "react";
import { CircleDot } from "lucide-react";

/** Custom offal icon – hearts, liver, bones on parchment.
 * Falls back to CircleDot Lucide icon if image missing. */
export function OffalIcon({ className }: { className?: string }) {
  const [error, setError] = useState(false);
  if (error)
    return <CircleDot className={className ?? "size-9 sm:size-10"} strokeWidth={1.5} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/icons/offal.png"
      alt="פנים"
      width={80}
      height={80}
      className={`object-contain mix-blend-multiply ${className ?? "size-16 sm:size-20"}`}
      onError={() => setError(true)}
    />
  );
}
