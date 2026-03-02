"use client";

import { useState } from "react";
import { Share2, Link2, Check } from "lucide-react";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/config";

const shareText = "גילו את בשרים על הדרך – הזמנת בשר פרימיום עד הבית! 🥩";
const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + " " + SITE_URL)}`;

export function ShareCta() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SITE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: open share dialog if available
      if (navigator.share) {
        navigator.share({
          title: "בשרים על הדרך",
          url: SITE_URL,
          text: shareText,
        });
      }
    }
  };

  return (
    <section className="scroll-mt-24 rounded-xl border border-stone-200/80 bg-stone-50/60 px-4 py-4">
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
        <Share2 className="size-4 text-stone-500" />
        <span className="text-sm text-stone-600">שתפו עם החברים:</span>
        <a href={whatsappShareUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-[#25D366] hover:bg-[#25D366]/10 hover:text-[#25D366]">
            <WhatsAppIcon className="size-4" />
            וואטסאפ
          </Button>
        </a>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-stone-600"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="size-3.5 text-green-600" />
          ) : (
            <Link2 className="size-3.5" />
          )}
          {copied ? "הועתק" : "העתק קישור"}
        </Button>
      </div>
    </section>
  );
}
