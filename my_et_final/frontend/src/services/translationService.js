// services/translationService.js
// MyMemory Translation API — completely FREE, no API key required
// Limit: 5000 chars/day per IP (sufficient for demo)

const MYMEMORY_URL = "https://api.mymemory.translated.net/get";

// Map app lang codes → MyMemory langpair codes
const LANG_PAIR = {
  ta: "en-US|ta-IN",
  hi: "en-US|hi-IN",
  ml: "en-US|ml-IN",
  te: "en-US|te-IN",
  bn: "en-US|bn-IN",
  mr: "en-US|mr-IN",
};

// In-memory cache to avoid re-translating same strings
const cache = new Map();

function cacheKey(text, lang) {
  return `${lang}::${text.slice(0, 60)}`;
}

export async function translateText(text, targetLang) {
  if (!text || !targetLang || targetLang === "en") return text;

  const key = cacheKey(text, targetLang);
  if (cache.has(key)) return cache.get(key);

  const langpair = LANG_PAIR[targetLang];
  if (!langpair) return text;

  try {
    // MyMemory has a 500 char limit per request, split if needed
    const chunk = text.slice(0, 500);
    const params = new URLSearchParams({ q: chunk, langpair });
    const res = await fetch(`${MYMEMORY_URL}?${params.toString()}`, {
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return text;
    const data = await res.json();

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translated = data.responseData.translatedText;
      // Sanity check — API sometimes returns HTML error strings
      if (translated.length > 2 && !translated.includes("PLEASE SELECT")) {
        cache.set(key, translated);
        return translated;
      }
    }
    return text;
  } catch (e) {
    console.warn("[Translation] MyMemory error:", e.message);
    return text;
  }
}

export async function translateArticle(article, targetLang) {
  if (targetLang === "en") return article;
  try {
    const [title, summary] = await Promise.all([
      translateText(article.title, targetLang),
      translateText((article.summary || "").slice(0, 400), targetLang),
    ]);
    return { ...article, title, summary, _translated: true };
  } catch {
    return article;
  }
}

export const LANGUAGE_OPTIONS = [
  { code: "en", label: "EN", name: "English", native: "English" },
  { code: "hi", label: "हि", name: "Hindi", native: "हिंदी" },
  { code: "ta", label: "த", name: "Tamil", native: "தமிழ்" },
  { code: "ml", label: "മ", name: "Malayalam", native: "മലയാളം" },
  { code: "te", label: "తె", name: "Telugu", native: "తెలుగు" },
  { code: "bn", label: "বা", name: "Bengali", native: "বাংলা" },
  { code: "mr", label: "म", name: "Marathi", native: "मराठी" },
];