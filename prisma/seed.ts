import { PrismaClient } from "@prisma/client";
import catalog from "./seed-catalog.json";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (in order of dependencies)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.meatProduct.deleteMany();
  await prisma.category.deleteMany();

  // Seed categories
  for (const cat of catalog.categories) {
    await prisma.category.create({
      data: {
        slug: cat.slug,
        nameHe: cat.nameHe,
        sortOrder: cat.sortOrder,
      },
    });
  }

  // Get category IDs
  const categories = await prisma.category.findMany();
  const categoryMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  const BEST_SELLERS: { nameHe: string; order: number }[] = [
    { nameHe: "אנטריקוט", order: 1 },
    { nameHe: "טחון בקר", order: 2 },
    { nameHe: "שניצל עגל (שייטל)", order: 3 },
    { nameHe: "המבורגר 170", order: 4 },
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
    "כנפיים/כרעיים/שוקיים": "ChickenImage",
    "לבבות עוף": "OffalImage",
    "כבד עוף": "OffalImage",
    "טחון עוף": "ChickenImage",
    "טחון פרגית": "PargitImage",
  };

  // Seed products
  for (const p of catalog.products) {
    const categoryId = categoryMap[p.categorySlug];
    if (!categoryId) throw new Error(`Unknown category: ${p.categorySlug}`);

    await prisma.meatProduct.create({
      data: {
        categoryId,
        nameHe: p.nameHe,
        descriptionHe: p.descriptionHe,
        pricePerKg: p.pricePerKg,
        imageUrl: p.imageUrl,
        requiresAdvanceOrder: p.requiresAdvanceOrder ?? false,
        isBestSeller: bestSellerSet.has(p.nameHe),
        bestSellerOrder: bestSellerOrderMap[p.nameHe] ?? null,
        iconName: PRODUCT_ICONS[p.nameHe] ?? (p.categorySlug === "ground" ? "GroundMeat" : p.categorySlug === "steaks" ? "Beef" : p.categorySlug === "chicken" ? "Drumstick" : "LambChop"),
      },
    });
  }

  // Seed example friend recommendations
  await prisma.friendRecommendation.deleteMany();
  await prisma.friendRecommendation.createMany({
    data: [
      {
        name: "דני כהן",
        imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        quote: "הבשר הכי טרי וטעים באזור. הזמנתי פעמיים והתעניינתי.",
        sortOrder: 1,
      },
      {
        name: "מיכל לוי",
        imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        quote: "ממליצה בחום! האיכות מעולה והמשלוח מהיר.",
        sortOrder: 2,
      },
      {
        name: "יוסי אברהם",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        quote: "בשר על הדרך הפכו את ההזמנה השבועית לחוויה.",
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

  console.log("✅ Seeded", catalog.categories.length, "categories,", catalog.products.length, "products, and friend recommendations");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
