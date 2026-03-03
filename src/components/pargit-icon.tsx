"use client";

import { useState } from "react";
import { Drumstick } from "lucide-react";

/** Custom pargit (chicken thigh) icon.
 * Falls back to Drumstick Lucide icon if image missing. */
export function PargitIcon({ className }: { className?: string }) {
  const [error, setError] = useState(false);
  if (error)
    return <Drumstick className={className ?? "size-9 sm:size-10"} strokeWidth={1.5} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/icons/pargit.png"
      alt="פרגית"
      width={80}
      height={80}
      className={`object-contain mix-blend-multiply ${className ?? "size-16 sm:size-20"}`}
      onError={() => setError(true)}
    />
  );
}
