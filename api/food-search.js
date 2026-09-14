// Vercel serverless function: GET /api/food-search?q=...
// Proxies USDA FoodData Central so the app can search a huge food database
// without exposing the API key to the browser.
//
// Setup: add an environment variable USDA_API_KEY in the Vercel project
// (Settings -> Environment Variables). Get a free key in ~1 minute at
// https://fdc.nal.usda.gov/api-key-signup.html
//
// Returns: { foods: [{ name, serv, cal, p, c, f, fiber }] }

const NUT = { cal: ["208", "Energy"], p: ["203"], c: ["205"], f: ["204"], fiber: ["291"] };

function pick(nutrients, keys) {
  for (const n of nutrients || []) {
    const num = String(n.nutrientNumber || n.number || "");
    const name = n.nutrientName || n.name || "";
    if (keys.includes(num) || keys.includes(name)) {
      const v = n.value != null ? n.value : n.amount;
      if (typeof v === "number") return v;
    }
  }
  return 0;
}

export default async function handler(req, res) {
  const key = process.env.USDA_API_KEY;
  if (!key) {
    res.status(503).json({ error: "USDA_API_KEY not configured" });
    return;
  }
  const q = (req.query.q || "").toString().trim();
  if (!q) { res.status(400).json({ error: "missing query" }); return; }

  const url = "https://api.nal.usda.gov/fdc/v1/foods/search?api_key=" + encodeURIComponent(key) +
    "&query=" + encodeURIComponent(q) +
    "&pageSize=20&dataType=" + encodeURIComponent("Foundation,SR Legacy,Survey (FNDDS),Branded");

  try {
    const r = await fetch(url);
    if (!r.ok) { res.status(502).json({ error: "usda " + r.status }); return; }
    const data = await r.json();
    const foods = (data.foods || []).map(f => {
      const n = f.foodNutrients || [];
      // USDA search nutrients are per 100 g; scale to one labeled serving when we can.
      let factor = 1, serv = "100 g";
      if (f.servingSize && /gram|^g$/i.test(f.servingSizeUnit || "")) {
        factor = f.servingSize / 100;
        serv = Math.round(f.servingSize) + " g";
      }
      const name = (f.brandName ? f.brandName + " — " : "") + (f.description || "Food");
      return {
        name: name.length > 70 ? name.slice(0, 70) + "…" : name,
        serv,
        cal: pick(n, NUT.cal) * factor,
        p: pick(n, NUT.p) * factor,
        c: pick(n, NUT.c) * factor,
        f: pick(n, NUT.f) * factor,
        fiber: pick(n, NUT.fiber) * factor
      };
    }).filter(x => x.cal > 0);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.status(200).json({ foods });
  } catch (e) {
    res.status(502).json({ error: "fetch failed" });
  }
}
