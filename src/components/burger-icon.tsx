"use client";

import Image from "next/image";

/** Custom burger icon – raw patties on paper.
 * Larger size for clarity; mix-blend-multiply removes white background. */
export function BurgerIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/icons/burger.png"
      alt="המבורגר"
      width={80}
      height={80}
      className={`object-contain mix-blend-multiply ${className ?? "size-16 sm:size-20"}`}
    />
  );
}
