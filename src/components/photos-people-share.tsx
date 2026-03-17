import Image from "next/image";

const PHOTOS = [
  { src: "/images/photos-shared/photo1.png", alt: "בשר טרי על מגבת נייר" },
  { src: "/images/photos-shared/photo2.png", alt: "הכנת ארוחה – בשר עם תפוחי אדמה ועגבניות" },
  { src: "/images/photos-shared/photo3.png", alt: "סטייקים אנטריקוט באריזה ואקום" },
  { src: "/images/photos-shared/photo4.png", alt: "חתיכת בשר על קרש חיתוך" },
  { src: "/images/photos-shared/photo5.png", alt: "בשר בקר, שוק טלה ונקניקיות באריזה ואקום" },
  { src: "/images/photos-shared/photo6.png", alt: "סטייקים צלויים על קרש חיתוך" },
  { src: "/images/photos-shared/photo7.png", alt: "צלעות טלה באריזה ואקום" },
  { src: "/images/photos-shared/photo8.png", alt: "נקניקיות כשרות מטובלות" },
  { src: "/images/photos-shared/photo9.png", alt: "בשר על הגריל" },
];

export function PhotosPeopleShare() {
  return (
    <section
      className="scroll-mt-24 rounded-2xl border border-amber-200/60 bg-white/80 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] sm:p-8"
      id="photos-shared"
    >
      <h2 className="mb-2 text-center text-2xl font-bold text-stone-800 sm:text-3xl">
        תמונות שמשתפים
      </h2>
      <p className="mb-6 text-center text-sm text-stone-500 sm:text-base">
        גללו לראות עוד ←
      </p>
      <div className="relative -mx-4 sm:-mx-6">
        {/* Gradient fade on edges to hint at scroll */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white/95 to-transparent sm:w-28" aria-hidden />
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white/95 to-transparent sm:w-28" aria-hidden />
        <div
          className="flex gap-5 overflow-x-auto px-4 pb-4 scroll-smooth sm:gap-6 sm:px-6 sm:pb-6"
          style={{ scrollbarGutter: "stable" }}
        >
          {PHOTOS.map((photo, i) => (
            <div
              key={i}
              className="relative h-64 w-64 shrink-0 overflow-hidden rounded-2xl bg-stone-100 shadow-md sm:h-72 sm:w-72 md:h-80 md:w-80"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 256px, (max-width: 768px) 288px, 320px"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
