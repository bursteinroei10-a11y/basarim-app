"use client";

import Image from "next/image";

/** Custom schnitzel icon – breaded cutlets.
 * Larger size for clarity; mix-blend-multiply removes white background. */
export function SchnitzelIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/icons/schnitzel.png"
      alt="שניצל"
      width={80}
      height={80}
      className={`object-contain mix-blend-multiply ${className ?? "size-16 sm:size-20"}`}
    />
  );
}
