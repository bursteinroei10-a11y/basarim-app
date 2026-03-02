"use client";

import { useState } from "react";
import { MEAT_CATEGORY_ICONS } from "@/components/meat-icons";

const LambChopSvg = MEAT_CATEGORY_ICONS.lamb;

/** Custom lamb chops icon – lamb rib/shoulder on parchment.
 * Falls back to LambChop SVG if image missing. */
export function LambChopImageIcon({ className }: { className?: string }) {
  const [error, setError] = useState(false);
  if (error)
    return <LambChopSvg className={className ?? "size-9 sm:size-10"} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/icons/lamb.png"
      alt="טלה"
      width={80}
      height={80}
      className={`object-contain mix-blend-multiply ${className ?? "size-16 sm:size-20"}`}
      onError={() => setError(true)}
    />
  );
}
