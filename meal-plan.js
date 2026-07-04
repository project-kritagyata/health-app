// Vercel/Netlify-style serverless function. Keeps the Anthropic API key server-side.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { profile, calorieTarget, macros } = req.body || {};
  if (!profile || !calorieTarget || !macros) {
    return res.status(400).json({ error: "Missing profile, calorieTarget, or macros" });
  }

  const allergyNote = profile.allergies?.length
    ? `Strictly avoid these allergens: ${profile.allergies.join(", ")}.`
    : `No allergies to avoid.`;

  const prompt = `Create a one-day balanced meal plan for a person with:
- Goal: ${profile.goal}
- Daily calorie target: ${calorieTarget} kcal
- Macro targets: ${macros.protein}g protein, ${macros.carbs}g carbs, ${macros.fat}g fat
${allergyNote}

Respond with ONLY valid JSON, no markdown fences, in exactly this shape:
{
  "meals": [
    {"meal": "Breakfast" | "Lunch" | "Dinner" | "Snack", "name": "string", "items": ["string", "string"], "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number}
  ],
  "totalCalories": number,
  "notes": "one short sentence"
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: "Anthropic API error", detail: errText });
    }

    const data = await response.json();
    const text = (data.content || []).map((b) => (b.type === "text" ? b.text : "")).join("\n");
    res.status(200).json({ raw: text });
  } catch (err) {
    res.status(500).json({ error: "Server error", detail: String(err) });
  }
}
