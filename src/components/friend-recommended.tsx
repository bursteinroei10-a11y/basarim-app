import Image from "next/image";

export interface FriendRecommendation {
  id: string;
  name: string;
  imageUrl: string;
  quote: string;
  sortOrder: number;
}

interface FriendRecommendedProps {
  items: FriendRecommendation[];
}

export function FriendRecommended({ items }: FriendRecommendedProps) {
  if (items.length === 0) return null;

  return (
    <section className="scroll-mt-24" id="friend-recommended">
      <h2 className="mb-6 text-2xl font-bold text-stone-800 sm:text-3xl">
        חברים המליצו
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col items-center rounded-2xl border border-amber-200/60 bg-white/80 p-6 text-center shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
          >
            <div className="relative size-16 overflow-hidden rounded-full bg-stone-200">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <h3 className="mt-3 font-semibold text-stone-800">{item.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              &quot;{item.quote}&quot;
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
