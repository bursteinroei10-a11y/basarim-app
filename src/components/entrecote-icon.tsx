"use client";

import Image from "next/image";

/** Custom entrecote/ribeye steak icon – stylized meat cuts with marbling.
 * Larger size for clarity; mix-blend-multiply removes white background. */
export function EntrecoteIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/icons/entrecote.png"
      alt="אנטריקוט"
      width={80}
      height={80}
      className={`object-contain mix-blend-multiply ${className ?? "size-16 sm:size-20"}`}
    />
  );
}
