export const BENEFIT_TO_PRODUCT = {
  immunity: ["Urolithin A", "Liquid Turmeric"],
  sleep: ["Spermidine"],
  insomnia: ["Spermidine"],
  energy: ["NMN + Resveratrol"],
  fatigue: ["NMN + Resveratrol"],
  longevity: ["NMN + Resveratrol", "Spermidine"],
  aging: ["NMN + Resveratrol", "Spermidine"],
  inflammation: ["Liquid Turmeric"],
  recovery: ["Urolithin A"],
  muscle: ["Urolithin A"],
  mitochondria: ["Urolithin A", "NMN + Resveratrol"],
  thyroid: ["NMN + Resveratrol"],
  hashimoto: ["NMN + Resveratrol"]
};

export function getMappedProducts(message) {
   const text = String(message || "").toLowerCase();

  const products = [];

  for (const [keyword, mappedProducts] of Object.entries(BENEFIT_TO_PRODUCT)) {
    if (text.includes(keyword)) {
      products.push(...mappedProducts);
    }
  }

  return [...new Set(products)];
}