import { ShoppingBag, CheckCircle, Clock, Smile, MapPin } from "lucide-react";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { Button } from "@/components/ui/button";
import { WHATSAPP_CONTACT_URL, WHATSAPP_GROUP_URL, PICKUP_ADDRESS, BALFOUR_ADDRESS, BALFOUR_WHATSAPP_CONTACT, BALFOUR_WHATSAPP_GROUP } from "@/lib/config";

const STEPS = [
  {
    icon: ShoppingBag,
    title: "בחרו מוצרים",
    desc: "עיינו במבחר הבשרים ובחרו את הכמויות",
  },
  {
    icon: CheckCircle,
    title: "שמרו הזמנה",
    desc: "הוסיפו לסל ושמרו את ההזמנה",
  },
  {
    icon: Clock,
    title: "ערכו עד לסגירה",
    desc: "שינוי כמויות, הוספה או הסרה – עד לתאריך שמופיע למעלה",
  },
  {
    icon: Smile,
    title: "איסוף הבשר",
    desc: "הצטרפו לקבוצת וואטסאפ לעדכונים על שעת ההגעה – בואו לאסוף את ההזמנה בהנאה!",
  },
];

export function HowItWorks() {
  return (
    <section
      className="scroll-mt-24 rounded-2xl border border-amber-200/60 bg-white/80 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] sm:p-8"
      id="how-it-works"
    >
      <h2 className="mb-8 text-center text-2xl font-bold text-stone-800 sm:text-3xl">
        איך זה עובד
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-3 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <step.icon className="size-7" />
            </div>
            <h3 className="font-semibold text-stone-800">{step.title}</h3>
            <p className="text-sm text-stone-500">{step.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-xl bg-stone-50/80 p-4">
        <p className="mb-3 text-center text-sm font-medium text-stone-700">נקודות איסוף</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          {/* Location 1 – שלמה המלך 14 */}
          <div className="flex flex-col items-center gap-3 rounded-lg bg-white/70 p-4 shadow-sm sm:min-w-[220px]">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-amber-600" />
              <p className="text-sm font-semibold text-stone-800">{PICKUP_ADDRESS}</p>
            </div>
            <a href={WHATSAPP_GROUP_URL} target="_blank" rel="noopener noreferrer" className="w-full">
              <Button variant="outline" size="sm" className="w-full gap-2 text-[#25D366] border-[#25D366]/40 hover:bg-[#25D366]/10">
                <WhatsAppIcon className="size-4" />
                קבוצת עדכוני איסוף
              </Button>
            </a>
            <a href={WHATSAPP_CONTACT_URL} target="_blank" rel="noopener noreferrer" className="w-full">
              <Button variant="outline" size="sm" className="w-full gap-2 text-[#25D366] border-[#25D366]/40 hover:bg-[#25D366]/10">
                <WhatsAppIcon className="size-4" />
                צרו קשר בוואטסאפ
              </Button>
            </a>
          </div>
          {/* Location 2 – בלפור 48 */}
          <div className="flex flex-col items-center gap-3 rounded-lg bg-white/70 p-4 shadow-sm sm:min-w-[220px]">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-amber-600" />
              <p className="text-sm font-semibold text-stone-800">{BALFOUR_ADDRESS}</p>
            </div>
            <a href={BALFOUR_WHATSAPP_GROUP} target="_blank" rel="noopener noreferrer" className="w-full">
              <Button variant="outline" size="sm" className="w-full gap-2 text-[#25D366] border-[#25D366]/40 hover:bg-[#25D366]/10">
                <WhatsAppIcon className="size-4" />
                קבוצת עדכוני איסוף
              </Button>
            </a>
            <a href={BALFOUR_WHATSAPP_CONTACT} target="_blank" rel="noopener noreferrer" className="w-full">
              <Button variant="outline" size="sm" className="w-full gap-2 text-[#25D366] border-[#25D366]/40 hover:bg-[#25D366]/10">
                <WhatsAppIcon className="size-4" />
                צרו קשר בוואטסאפ
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
