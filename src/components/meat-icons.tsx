/**
 * Meat-type icons inspired by butcher shop imagery (e.g. Tabit ordering UI).
 * Minimal, recognizable outlines for each meat category.
 * @see https://tabitisrael.co.il/tabit-order?orgName=Butcher%20Shop&step=menu
 */

import type { LucideIcon } from "lucide-react";
import { Beef, Drumstick } from "lucide-react";

/** Ground meat – oval mound (minced meat pile) */
function GroundMeatIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <ellipse cx="12" cy="14" rx="8" ry="5" />
      <ellipse cx="12" cy="10" rx="6" ry="4" />
    </svg>
  );
}

/** Lamb chop – lollipop shape (meat + bone) */
function LambChopIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <circle cx="12" cy="9" r="5" />
      <path d="M12 14v6" />
    </svg>
  );
}

export const MEAT_CATEGORY_ICONS: Record<string, LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  ground: GroundMeatIcon,
  lamb: LambChopIcon,
  steaks: Beef,
  chicken: Drumstick,
};

export function getMeatCategoryIcon(slug: string): LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>> {
  return MEAT_CATEGORY_ICONS[slug] ?? Beef;
}
