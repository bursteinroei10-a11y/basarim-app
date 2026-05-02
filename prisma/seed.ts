import { PrismaClient } from "@prisma/client";
import catalog from "./seed-catalog.json";

const prisma = new PrismaClient();

async function main() {
  // Never delete orders or order items – preserve all customer orders.
  // Upsert categories and products so re-running seed updates data without wiping orders.

  // Upsert categories (by unique slug)
  for (const cat of catalog.categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      create: {
        slug: cat.slug,
        nameHe: cat.nameHe,
        sortOrder: cat.sortOrder,
      },
      update: {
        nameHe: cat.nameHe,
        sortOrder: cat.sortOrder,
      },
    });
  }

  const categories = await prisma.category.findMany();
  const categoryMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));
  const existingProducts = await prisma.meatProduct.findMany();
  const productKey = (nameHe: string, categoryId: string) => `${nameHe}::${categoryId}`;
  const existingByKey = new Map(existingProducts.map((p) => [productKey(p.nameHe, p.categoryId), p]));

  const BEST_SELLERS: { nameHe: string; order: number }[] = [
    { nameHe: "אנטריקוט", order: 1 },
    { nameHe: "צלעות טלה", order: 2 },
    { nameHe: "פילה בקר", order: 3 },
    { nameHe: "טחון בקר", order: 4 },
    { nameHe: "שניצל עוף דק", order: 5 },
  ];
  const bestSellerSet = new Set(BEST_SELLERS.map((b) => b.nameHe));
  const bestSellerOrderMap = Object.fromEntries(BEST_SELLERS.map((b) => [b.nameHe, b.order]));

  // Per-product icon mapping (Lucide icon names)
  const PRODUCT_ICONS: Record<string, string> = {
    "טחון בקר": "GroundMeatImage",
    "טחון בקר + כבש": "GroundMeatImage",
    "נקניקיות צוריסו/מרגז/אלבמה (גאודה)": "SausageImage",
    "קבב טלה": "LambChopImage",
    "המבורגר 170": "Burger",
    "מיני המבורגר": "Burger",
    "ברוסט טלה (כל הצלע)": "LambChopImage",
    "אסאדו טלה (צלע מנוסר)": "LambChopImage",
    "שוק טלה": "LambChopImage",
    "בתף טלה": "LambChopImage",
    "צלעות טלה": "LambChopImage",
    "טיבון טלה": "LambChopImage",
    "אנטריקוט": "Entrecote",
    "סינטה": "BeefImage",
    "פילה בקר": "BeefImage",
    "פיקיניה": "GrillImage",
    "נתח קצבים עבה": "BeefImage",
    "פלאנק סטייק": "GrillImage",
    "שפיץ שייטל נקי": "BeefImage",
    "שניצל עגל (שייטל)": "Schnitzel",
    "שייטל נקי": "BeefImage",
    "בריסקט": "GrillImage",
    "אונטריב/גולש": "BeefImage",
    "שקדי עגל": "BeefImage",
    "שיפודי יקיטורי שקדי עגל": "BeefImage",
    "עצמות סירה/מח עצם": "OffalImage",
    "פרגית": "PargitImage",
    "חזה עוף נקי": "ChickenBreastImage",
    "פילה עוף נקי": "ChickenImage",
    "שניצל עוף דק": "Schnitzel",
    "רצועות עוף": "ChickenImage",
    "כנפיים": "ChickenImage",
    "כרעיים": "ChickenImage",
    "שוקיים": "ChickenImage",
    "לבבות עוף": "OffalImage",
    "כבד עוף": "OffalImage",
    "טחון עוף": "ChickenImage",
    "טחון פרגית": "PargitImage",
  };

  // Upsert products (by nameHe + categoryId) – never delete, so existing orders stay valid
  const productData = (p: (typeof catalog.products)[0], categoryId: string) => ({
    categoryId,
    nameHe: p.nameHe,
    descriptionHe: p.descriptionHe,
    pricePerKg: p.pricePerKg,
    imageUrl: p.imageUrl,
    requiresAdvanceOrder: p.requiresAdvanceOrder ?? false,
    isBestSeller: bestSellerSet.has(p.nameHe),
    bestSellerOrder: bestSellerOrderMap[p.nameHe] ?? null,
    iconName: PRODUCT_ICONS[p.nameHe] ?? (p.categorySlug === "ground" ? "GroundMeat" : p.categorySlug === "steaks" ? "Beef" : p.categorySlug === "chicken" ? "Drumstick" : "LambChop"),
  });

  for (const p of catalog.products) {
    const categoryId = categoryMap[p.categorySlug];
    if (!categoryId) throw new Error(`Unknown category: ${p.categorySlug}`);

    const key = productKey(p.nameHe, categoryId);
    const existing = existingByKey.get(key);

    if (existing) {
      await prisma.meatProduct.update({
        where: { id: existing.id },
        data: productData(p, categoryId),
      });
    } else {
      const created = await prisma.meatProduct.create({
        data: productData(p, categoryId),
      });
      existingByKey.set(key, created);
    }
  }

  // Deactivate legacy combined chicken product (replaced by 3 separate ones)
  await prisma.meatProduct.updateMany({
    where: { nameHe: "כנפיים/כרעיים/שוקיים" },
    data: { isActive: false },
  });

  // Seed friend recommendations
  await prisma.friendRecommendation.deleteMany();
  await prisma.friendRecommendation.createMany({
    data: [
      {
        name: "ירדן קטש",
        imageUrl: "/images/friends/yarden-katesh.png",
        quote: "איכות פרימיום במחירים נוחים, תענוג לסופ״ש",
        sortOrder: 1,
      },
      {
        name: "ערן אסייג",
        imageUrl: "/images/friends/eran-asaig.png",
        quote: "כייף זמין וטעים",
        sortOrder: 2,
      },
      {
        name: "עידו רענן",
        imageUrl: "/images/friends/ido-raan.png",
        quote: "המקום הקבוע החדש שלי",
        sortOrder: 3,
      },
    ],
  });

  // Default order cutoff: Wednesday 00:00 (Israel) – only if none exists
  const existingCutoff = await prisma.orderCutoff.findFirst();
  if (!existingCutoff) {
    await prisma.orderCutoff.create({
      data: {
        dayOfWeek: 3, // Wednesday
        hour: 0,
        minute: 0,
        timezone: "Asia/Jerusalem",
        label: "ברירת מחדל",
      },
    });
    console.log("✅ Created default cutoff: Wednesday 00:00 (Asia/Jerusalem)");
  }

  console.log("✅ Seeded", catalog.categories.length, "categories,", catalog.products.length, "products, and friend recommendations (orders were not modified)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
