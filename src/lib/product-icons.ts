import {
  Beef,
  Drumstick,
  Flame,
  Package,
  CircleDot,
  Bird,
  UtensilsCrossed,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { MEAT_CATEGORY_ICONS } from "@/components/meat-icons";
import { EntrecoteIcon } from "@/components/entrecote-icon";
import { GroundMeatImageIcon } from "@/components/ground-meat-icon";
import { SchnitzelIcon } from "@/components/schnitzel-icon";
import { BurgerIcon } from "@/components/burger-icon";
import { BeefIcon } from "@/components/beef-icon";
import { GrillIcon } from "@/components/grill-icon";
import { LambChopImageIcon } from "@/components/lamb-icon";
import { ChickenIcon } from "@/components/chicken-icon";
import { OffalIcon } from "@/components/offal-icon";
import { SausageIcon } from "@/components/sausage-icon";

/** Icon names for products - must match schema iconName.
 * Includes custom image icons and meat-type SVG icons. */
export const PRODUCT_ICON_MAP: Record<string, LucideIcon | React.ComponentType<{ className?: string }>> = {
  Beef,
  Drumstick,
  Flame,
  Package,
  CircleDot,
  Bird,
  UtensilsCrossed,
  Sparkles,
  GroundMeat: MEAT_CATEGORY_ICONS.ground,
  GroundMeatImage: GroundMeatImageIcon,
  LambChop: MEAT_CATEGORY_ICONS.lamb,
  LambChopImage: LambChopImageIcon,
  BeefImage: BeefIcon,
  GrillImage: GrillIcon,
  ChickenImage: ChickenIcon,
  OffalImage: OffalIcon,
  SausageImage: SausageIcon,
  Entrecote: EntrecoteIcon,
  Schnitzel: SchnitzelIcon,
  Burger: BurgerIcon,
};

/** Default icon when product has no iconName */
export const DEFAULT_PRODUCT_ICON = Beef;

export function getProductIcon(
  iconName: string | null | undefined
): LucideIcon | React.ComponentType<{ className?: string }> {
  if (!iconName) return DEFAULT_PRODUCT_ICON;
  return PRODUCT_ICON_MAP[iconName] ?? DEFAULT_PRODUCT_ICON;
}
