"use client";

import Image from "next/image";

/** Custom ground meat icon – stylized minced beef/lamb pile.
 * Larger size for clarity; mix-blend-multiply removes white background. */
export function GroundMeatImageIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/icons/ground-meat.png"
      alt="טחון"
      width={80}
      height={80}
      className={`object-contain mix-blend-multiply ${className ?? "size-16 sm:size-20"}`}
    />
  );
}
