/** Service & packaging fee: 12% of subtotal, minimum 30 NIS */

const FEE_PERCENT = 0.12;
const FEE_MIN_NIS = 30;

export function calculateServiceFee(subtotalNis: number): number {
  if (subtotalNis <= 0) return 0;
  const percentFee = Math.round(subtotalNis * FEE_PERCENT);
  return Math.max(FEE_MIN_NIS, percentFee);
}

export function calculateOrderTotal(subtotalNis: number): {
  subtotal: number;
  serviceFee: number;
  total: number;
} {
  const subtotal = Math.round(subtotalNis);
  const serviceFee = calculateServiceFee(subtotal);
  return { subtotal, serviceFee, total: subtotal + serviceFee };
}
