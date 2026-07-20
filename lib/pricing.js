export const MIN_ORDER_KOPECKS = 50000; // 500 ₽
const FREE_DELIVERY_THRESHOLD_KOPECKS = 75000; // 750 ₽
const DELIVERY_FEE_KOPECKS = 14900; // 149 ₽

export function isBelowMinimum(subtotalKopecks) {
  return subtotalKopecks < MIN_ORDER_KOPECKS;
}

export function computeDeliveryFee(subtotalKopecks) {
  if (subtotalKopecks >= FREE_DELIVERY_THRESHOLD_KOPECKS) return 0;
  return DELIVERY_FEE_KOPECKS;
}
