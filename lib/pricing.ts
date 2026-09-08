export function getDiscountedPrice(price: number, percent: number): number {
  const basePrice = Number(price);
  const discountPercent = Math.min(100, Math.max(0, Number(percent) || 0));

  if (!Number.isFinite(basePrice) || discountPercent === 0) return basePrice;
  return Math.round(basePrice * (1 - discountPercent / 100) * 100) / 100;
}

export function formatPrice(price: number): string {
  return Number(price).toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}
