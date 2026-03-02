import type { LucideIcon } from "lucide-react";
import { getMeatCategoryIcon } from "@/components/meat-icons";

/**
 * Fixed icon per category, inspired by butcher shop meat imagery
 * (e.g. Tabit: tabitisrael.co.il/tabit-order?orgName=Butcher%20Shop&step=menu)
 */
export function getCategoryIcon(slug: string): LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>> {
  return getMeatCategoryIcon(slug);
}
