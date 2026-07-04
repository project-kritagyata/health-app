export const SAMPLE_BARCODES = {
  "0000000000017": { name: "Plain Greek Yogurt (170g)", quantity: "170 g", calories: 100, protein_g: 17, carbs_g: 6, fat_g: 0 },
  "0000000000024": { name: "Granola Bar", quantity: "1 bar", calories: 190, protein_g: 4, carbs_g: 27, fat_g: 8 },
  "0000000000031": { name: "Almond Milk (1 cup)", quantity: "1 cup", calories: 40, protein_g: 1, carbs_g: 2, fat_g: 3 },
  "0000000000048": { name: "Whole Wheat Bread (1 slice)", quantity: "1 slice", calories: 80, protein_g: 4, carbs_g: 14, fat_g: 1 },
};

export async function lookupOpenFoodFacts(barcode) {
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`);
  if (!res.ok) throw new Error("Lookup request failed");
  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;
  const p = data.product;
  const n = p.nutriments || {};
  const hasServing = n["energy-kcal_serving"] != null;
  const calories = hasServing ? n["energy-kcal_serving"] : n["energy-kcal_100g"];
  const protein = hasServing ? n["proteins_serving"] : n["proteins_100g"];
  const carbs = hasServing ? n["carbohydrates_serving"] : n["carbohydrates_100g"];
  const fat = hasServing ? n["fat_serving"] : n["fat_100g"];
  if (calories == null) return null;
  return {
    name: p.product_name || p.generic_name || `Product ${barcode}`,
    quantity: hasServing ? (p.serving_size || "1 serving") : "100 g",
    calories: Math.round(calories) || 0,
    protein_g: Math.round(protein) || 0,
    carbs_g: Math.round(carbs) || 0,
    fat_g: Math.round(fat) || 0,
    allergensText: [p.allergens, p.ingredients_text].filter(Boolean).join(" "),
  };
}
