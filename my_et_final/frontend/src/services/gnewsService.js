/**
 * GNews Service — My ET
 * Real-time news from GNews API (free tier: 100 req/day)
 * All 8 roles supported with tailored queries
 */

const GNEWS_KEY = import.meta.env.VITE_GNEWS_API_KEY || "";
const GNEWS_BASE = "https://gnews.io/api/v4";

// Role → GNews search queries (India-focused)
const ROLE_QUERIES = {
  investor:             "India stock market OR Sensex OR Nifty OR RBI OR economy India",
  founder:              "India startup funding OR venture capital OR unicorn OR IPO India",
  student:              "India economy explained OR Union Budget OR GDP India OR education",
  policy_analyst:       "India government policy OR RBI monetary policy OR geopolitics India",
  cinema_enthusiast:    "Bollywood box office OR OTT streaming India OR Indian cinema 2025",
  sportsperson:         "India cricket OR IPL 2025 OR Indian football OR sports India",
  literature_enthusiast:"India books OR Booker Prize OR Indian authors OR publishing India",
  entrepreneur:         "India MSME OR GST India OR small business India OR export India",
};

// Topic searches (for Story Arc Tracker real data)
const TOPIC_QUERIES = {
  "tesla india":    "Tesla India 2025",
  "rbi rate":       "RBI repo rate 2025",
  "india ai":       "India AI policy IndiaAI mission",
  "ipl media":      "IPL media rights 2025 BCCI",
  "startup unicorn":"India unicorn startup 2025",
};

function relativeTime(dateStr) {
  try {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60)    return "Just now";
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch { return "Recently"; }
}

function detectSentiment(text) {
  const t = (text || "").toLowerCase();
  const pos = ["surge","rally","gain","profit","rise","jump","record","boost","growth","win","beat","strong","bullish","soar","hit","success","up","launch","award","champion"];
  const neg = ["fall","drop","crash","loss","decline","down","cut","crisis","concern","slump","plunge","miss","weak","negative","bearish","tumble","ban","suspend","fine","arrest"];
  const p = pos.filter(w => t.includes(w)).length;
  const n = neg.filter(w => t.includes(w)).length;
  if (p > n) return "positive";
  if (n > p) return "negative";
  return "neutral";
}

function extractTags(title, source) {
  const words = (title || "").match(/\b[A-Z][a-zA-Z]{3,}\b/g) || [];
  const unique = [...new Set(words)].slice(0, 4);
  if (unique.length < 2) { unique.push(source || "India", "News"); }
  return unique.slice(0, 4);
}

function calcImpactScore(article) {
  const title = (article.title || "").toLowerCase();
  const high = ["rbi","sensex","nifty","budget","gdp","crore","billion","ipo","merger","rate","inflation","rupee","fed","bcci","ipl","court","parliament","pm modi"];
  return Math.min(9, 5 + high.filter(w => title.includes(w)).length);
}

function hashId(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return "n" + Math.abs(h).toString(36).slice(0, 8);
}

function mapArticle(a, role) {
  return {
    id: hashId(a.url || a.title),
    title: a.title,
    summary: a.description || a.title,
    source: a.source?.name || "GNews",
    category: role,
    url: a.url,
    image: a.image || null,
    time: relativeTime(a.publishedAt),
    pubDate: a.publishedAt,
    sentiment: detectSentiment(a.title + " " + (a.description || "")),
    impact_score: calcImpactScore(a),
    tags: extractTags(a.title, a.source?.name),
    readTime: `${Math.floor(Math.random() * 3) + 2} min`,
    keyPoints: [a.description?.slice(0, 120) || a.title],
  };
}

// In-memory cache
const cache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 min

export async function fetchNewsByRole(role) {
  const now = Date.now();
  if (cache[role] && now - cache[role].ts < CACHE_TTL) return cache[role].data;

  const query = ROLE_QUERIES[role] || ROLE_QUERIES.investor;
  const url = `${GNEWS_BASE}/search?q=${encodeURIComponent(query)}&lang=en&country=in&max=10&sortby=publishedAt&apikey=${GNEWS_KEY}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) { console.warn(`[GNews] HTTP ${res.status}`); return cache[role]?.data || []; }
    const json = await res.json();
    const articles = (json.articles || []).map(a => mapArticle(a, role));
    cache[role] = { data: articles, ts: now };
    return articles;
  } catch (e) {
    console.warn("[GNews] fetch error:", e.message);
    return cache[role]?.data || [];
  }
}

export async function fetchTopHeadlines() {
  const cacheKey = "_headlines";
  const now = Date.now();
  if (cache[cacheKey] && now - cache[cacheKey].ts < CACHE_TTL) return cache[cacheKey].data;

  const url = `${GNEWS_BASE}/top-headlines?lang=en&country=in&max=8&topic=business&apikey=${GNEWS_KEY}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const json = await res.json();
    const articles = (json.articles || []).map(a => mapArticle(a, "headlines"));
    cache[cacheKey] = { data: articles, ts: now };
    return articles;
  } catch { return []; }
}

export async function fetchStoryArcNews(topic) {
  const query = TOPIC_QUERIES[topic.toLowerCase()] || topic;
  const url = `${GNEWS_BASE}/search?q=${encodeURIComponent(query)}&lang=en&max=5&sortby=publishedAt&apikey=${GNEWS_KEY}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.articles || []).map(a => mapArticle(a, topic));
  } catch { return []; }
}

export function searchArticles(articles, query) {
  if (!query?.trim()) return articles;
  const q = query.toLowerCase();
  return articles.filter(a =>
    a.title?.toLowerCase().includes(q) ||
    a.summary?.toLowerCase().includes(q) ||
    a.source?.toLowerCase().includes(q) ||
    a.tags?.some(t => t.toLowerCase().includes(q))
  );
}
