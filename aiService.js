import { API_BASE_URL } from "../config";

function extractJSON(text) {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const startArr = cleaned.indexOf("[");
  let s = start;
  if (startArr !== -1 && (start === -1 || startArr < start)) s = startArr;
  const lastBrace = cleaned.lastIndexOf("}");
  const lastBracket = cleaned.lastIndexOf("]");
  const e = Math.max(lastBrace, lastBracket);
  const slice = s !== -1 && e !== -1 ? cleaned.slice(s, e + 1) : cleaned;
  return JSON.parse(slice);
}

async function callApi(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  const data = await res.json();
  return data.raw;
}

export const AIService = {
  async analyzeMealImage(base64Data, mediaType, allergies) {
    const text = await callApi("/api/analyze-meal", { base64Image: base64Data, mediaType, allergies });
    const json = extractJSON(text);
    if (!json || !Array.isArray(json.items)) throw new Error("Malformed AI response");
    return json;
  },

  async generateMealPlan(profile, calorieTarget, macros) {
    const text = await callApi("/api/meal-plan", { profile, calorieTarget, macros });
    const json = extractJSON(text);
    if (!json || !Array.isArray(json.meals)) throw new Error("Malformed AI response");
    return json;
  },
};
