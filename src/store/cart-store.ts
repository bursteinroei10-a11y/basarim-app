import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calculateOrderTotal } from "@/lib/order-fees";

export interface CartItem {
  productId: string;
  nameHe: string;
  pricePerKg: number;
  quantityKg: number;
  imageUrl?: string;
}

interface CartStore {
  items: CartItem[];
  cartPulse: number;
  addItem: (item: Omit<CartItem, "quantityKg"> & { quantityKg?: number }) => void;
  updateQuantity: (productId: string, quantityKg: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  subtotal: () => number;
  serviceFee: () => number;
  totalAmount: () => number;
  totalItems: () => number;
}

const STEP = 0.5;
const MIN_QTY = 0.5;

function roundToStep(n: number) {
  return Math.round(n / STEP) * STEP;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartPulse: 0,
      addItem: (item) => {
        const qty = Math.max(MIN_QTY, roundToStep(item.quantityKg ?? MIN_QTY));
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          const newItems = existing
            ? state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantityKg: roundToStep(i.quantityKg + qty) }
                  : i
              )
            : [...state.items, { ...item, quantityKg: qty }];
          return {
            items: newItems,
            cartPulse: state.cartPulse + 1,
          };
        });
      },
      updateQuantity: (productId, quantityKg) => {
        const qty = Math.max(0, roundToStep(quantityKg));
        set((state) => {
          const existing = state.items.find((i) => i.productId === productId);
          const isAdding = existing && qty > existing.quantityKg;
          if (qty === 0) {
            return { items: state.items.filter((i) => i.productId !== productId) };
          }
          return {
            items: state.items.map((i) =>
              i.productId === productId ? { ...i, quantityKg: qty } : i
            ),
            ...(isAdding && { cartPulse: state.cartPulse + 1 }),
          };
        });
      },
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      clearCart: () => set({ items: [] }),
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.pricePerKg * i.quantityKg, 0),
      serviceFee: () => {
        const sub = get().subtotal();
        return calculateOrderTotal(sub).serviceFee;
      },
      totalAmount: () => {
        const sub = get().subtotal();
        return calculateOrderTotal(sub).total;
      },
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantityKg, 0),
    }),
    {
      name: "basarim-cart",
      partialize: (s) => ({ items: s.items }),
    }
  )
);
