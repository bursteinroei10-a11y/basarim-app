"use client";

import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ProductCard, type ProductCardProduct } from "@/components/product-card";
import { getCategoryIcon } from "@/lib/category-icons";
import { cn } from "@/lib/utils";

interface CategoryWithProducts {
  slug: string;
  nameHe: string;
  products: ProductCardProduct[];
}

interface CategoryCardsProps {
  categories: CategoryWithProducts[];
}

export function CategoryCards({ categories }: CategoryCardsProps) {
  return (
    <section className="scroll-mt-24" id="categories">
      <h2 className="mb-6 text-2xl font-bold text-stone-800 sm:text-3xl">
        מבחר הבשרים שלנו
      </h2>
      <div className="space-y-2">
        {categories.map(({ slug, nameHe, products }) => {
          const Icon = getCategoryIcon(slug);
          return (
            <Collapsible key={slug} defaultOpen={false} className="group">
              <CollapsibleTrigger
                className={cn(
                  "flex items-center gap-2 rounded-xl border border-amber-200/60 bg-white/80 px-3 py-2.5 text-right shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
                  "hover:bg-amber-50/60 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200"
                )}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <Icon className="size-4" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium text-stone-800">{nameHe}</span>
                <ChevronDown className="size-3.5 shrink-0 text-stone-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </section>
  );
}
