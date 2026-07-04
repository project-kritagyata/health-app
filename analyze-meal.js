// Vercel/Netlify-style serverless function.
// Keeps the Anthropic API key on the server — the browser never sees it.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { base64Image, mediaType, allergies } = req.body || {};
  if (!base64Image) {
    return res.status(400).json({ error: "Missing base64Image" });
  }

  const allergyNote =
    allergies && allergies.length
      ? `The user has these allergies/intolerances: ${allergies.join(", ")}. For each food, set "allergyRisk" to true if it plausibly contains any of these, and list which ones in "allergenMatches".`
      : `The user has no listed allergies. Set "allergyRisk" to false for all items and "allergenMatches" to an empty array.`;

  const prompt = `You are a nutrition estimation assistant. Look at this meal photo and identify each distinct food item.
${allergyNote}

Respond with ONLY valid JSON, no preamble, no markdown fences, matching exactly this shape:
{
  "items": [
    {"name": "string", "quantity": "string like '1 cup' or '150 g'", "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number, "allergyRisk": boolean, "allergenMatches": ["string"]}
  ],
  "confidence": "high" | "medium" | "low"
}
If you cannot identify any food in the image, return {"items": [], "confidence": "low"}.`;

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
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType || "image/jpeg", data: base64Image } },
              { type: "text", text: prompt },
            ],
          },
        ],
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
