"use client";

import { useState } from "react";
import { Package } from "lucide-react";

/** Custom sausage icon – sausage links on brown paper.
 * Falls back to Package Lucide icon if image missing. */
export function SausageIcon({ className }: { className?: string }) {
  const [error, setError] = useState(false);
  if (error)
    return <Package className={className ?? "size-9 sm:size-10"} strokeWidth={1.5} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/icons/sausage.png"
      alt="נקניקיות"
      width={80}
      height={80}
      className={`object-contain mix-blend-multiply ${className ?? "size-16 sm:size-20"}`}
      onError={() => setError(true)}
    />
  );
}
