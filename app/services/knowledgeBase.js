export const productBenefits = {
  "Spermidine": {
    searchName: "Spermidine",
    tags: ["sleep", "skin health", "hair health", "cell renewal"]
  },
  "Urolithin A": {
    searchName: "Urolithin A", 
    tags: ["immunity"]
  },
  "Liquid Turmeric": {
    searchName: "Liquid Turmeric",
    tags: ["immunity", "inflammation"]
  },
  "NMN + Resveratrol": {
    searchName: "NMN + Resveratrol",
    tags: ["energy", "longevity", "healthy aging"]
  }
};

export function buildBenefitsContext() {
  return Object.entries(productBenefits)
    .map(([name, data]) =>
      `- "${name}" (search as "${data.searchName}"): also supports ${data.tags.join(", ")}`
    )
    .join("\n");
}