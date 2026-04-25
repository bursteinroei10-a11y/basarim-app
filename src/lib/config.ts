/** Site URL for sharing (no trailing slash) */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://basarim-alhaderech.vercel.app";

/** Contact – direct chat with number (0547739073) */
export const WHATSAPP_CONTACT_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_CONTACT ?? "https://wa.me/972547739073";

/** Pickup updates – join the group for arrival time notifications */
export const WHATSAPP_GROUP_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_GROUP ?? "https://chat.whatsapp.com/HFHAR9Z5VGc4npf3cd4Q2H?mode=gi_t";

/** Pickup location 1 */
export const PICKUP_ADDRESS = "שלמה המלך 14";

/** Pickup location 2 – Balfour */
export const BALFOUR_ADDRESS = "בלפור 48";
export const BALFOUR_PHONE = "+972 50-724-4838";
export const BALFOUR_WHATSAPP_GROUP = "https://chat.whatsapp.com/Lw0kAZvDVjy2L40r42LZYp?mode=gi_t";

/** All pickup locations */
export const PICKUP_LOCATIONS = [
  { label: PICKUP_ADDRESS, value: PICKUP_ADDRESS },
  { label: BALFOUR_ADDRESS, value: BALFOUR_ADDRESS },
] as const;
