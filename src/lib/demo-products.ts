import demoCatalog from "../../prisma/seed-catalog.json";

const categoryMap: Record<string, { id: string; nameHe: string; slug: string }> = {
  ground: { id: "demo-ground", nameHe: "טחונים", slug: "ground" },
  lamb: { id: "demo-lamb", nameHe: "טלה מקומי", slug: "lamb" },
  steaks: { id: "demo-steaks", nameHe: "סטייקים ונתחים לצלייה", slug: "steaks" },
  chicken: { id: "demo-chicken", nameHe: "תרנגולות", slug: "chicken" },
};

/** Per-product icons (meat-type imagery) - matches seed mapping */
const PRODUCT_ICONS: Record<string, string> = {
  "טחון בקר": "GroundMeatImage",
  "טחון בקר + כבש": "GroundMeatImage",
  "נקניקיות צוריסו/מרגז/אלבמה (גאודה)": "SausageImage",
  "קבב טלה": "LambChopImage",
  "המבורגר 170": "Burger",
  "מיני המבורגר": "Burger",
  "אנטריקוט": "Entrecote",
  "שניצל עגל (שייטל)": "Schnitzel",
  "שניצל עוף דק": "Schnitzel",
  "פרגית": "PargitImage",
  "חזה עוף נקי": "ChickenBreastImage",
  "בריסקט": "GrillImage",
};

const ICON_BY_CATEGORY: Record<string, string> = {
  ground: "GroundMeat",
  steaks: "BeefImage",
  chicken: "ChickenImage",
  lamb: "LambChopImage",
};

export type DemoProduct = {
  id: string;
  nameHe: string;
  descriptionHe: string | null;
  pricePerKg: number;
  imageUrl: string | null;
  iconName: string | null;
  requiresAdvanceOrder: boolean;
  category: { nameHe: string; slug: string };
};

export function getDemoProducts(): DemoProduct[] {
  return demoCatalog.products.map((p: { nameHe: string; descriptionHe: string; categorySlug: string; pricePerKg: number; imageUrl: string; requiresAdvanceOrder: boolean }, i: number) => {
    const cat = categoryMap[p.categorySlug as keyof typeof categoryMap];
    return {
      id: `demo-${i}`,
      nameHe: p.nameHe,
      descriptionHe: p.descriptionHe ?? null,
      pricePerKg: p.pricePerKg,
      imageUrl: p.imageUrl ?? null,
      iconName: PRODUCT_ICONS[p.nameHe] ?? ICON_BY_CATEGORY[p.categorySlug as keyof typeof ICON_BY_CATEGORY] ?? "Beef",
      requiresAdvanceOrder: p.requiresAdvanceOrder ?? false,
      category: { nameHe: cat?.nameHe ?? p.categorySlug, slug: cat?.slug ?? p.categorySlug },
    };
  });
}
