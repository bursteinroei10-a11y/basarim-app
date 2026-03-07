import Image from "next/image";

const PHOTOS = [
  { src: "/images/photos-shared/photo1.png", alt: "בשר טרי על מגבת נייר" },
  { src: "/images/photos-shared/photo2.png", alt: "הכנת ארוחה – בשר עם תפוחי אדמה ועגבניות" },
  { src: "/images/photos-shared/photo3.png", alt: "סטייקים אנטריקוט באריזה ואקום" },
  { src: "/images/photos-shared/photo4.png", alt: "חתיכת בשר על קרש חיתוך" },
];

export function PhotosPeopleShare() {
  return (
    <section
      className="scroll-mt-24 rounded-2xl border border-amber-200/60 bg-white/80 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] sm:p-8"
      id="photos-shared"
    >
      <h2 className="mb-6 text-center text-2xl font-bold text-stone-800 sm:text-3xl">
        תמונות שמשתפים
      </h2>
      <div className="-mx-2 overflow-x-auto px-2">
        <div className="flex gap-4 pb-2" style={{ width: "max-content" }}>
          {PHOTOS.map((photo, i) => (
            <div
              key={i}
              className="relative h-48 w-48 shrink-0 overflow-hidden rounded-xl bg-stone-100 sm:h-56 sm:w-56"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover"
                sizes="224px"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
