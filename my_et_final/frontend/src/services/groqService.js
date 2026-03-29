/**
 * Groq AI Service — My ET
 * Powers: Chat assistant (RAG), AI video scripts, avatar greetings, story analysis
 * Model: llama-3.3-70b-versatile (free on Groq)
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || "";

async function groqChat(messages, { temperature = 0.7, max_tokens = 600 } = {}) {
  if (!GROQ_KEY) throw new Error("VITE_GROQ_API_KEY not set in .env");
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({ model: GROQ_MODEL, messages, temperature, max_tokens }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) { const err = await res.text(); throw new Error(`Groq API ${res.status}: ${err}`); }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

const ROLE_SYSTEM_PROMPTS = {
  investor: `You are ARIA — Advanced Returns & Intelligence Assistant — an expert financial AI for Economic Times. Specialize in Indian stock markets, RBI policy, sectoral analysis, FII/DII flows, and portfolio intelligence. Be precise, cite numbers, explain market implications. Keep replies under 180 words.`,
  founder: `You are NOVA — Network & Opportunities Venture Assistant — a startup ecosystem AI for Economic Times. Specialize in Indian startup funding, VC trends, acquisitions, competitor intelligence, and market gaps. Be energetic, strategic, and actionable. Keep replies under 180 words.`,
  student: `You are SAGE — Student Advisory & Growth Engine — a friendly business education AI. Explain complex financial and business news in simple language with relatable Indian examples. Use analogies. Be encouraging and clear. Keep replies under 180 words.`,
  policy_analyst: `You are NEXUS — National & Economic Xpert for Understanding Signals — a macro policy AI. Specialize in RBI, Finance Ministry, geopolitics, trade, and regulatory analysis. Be precise, use formal language. Keep replies under 180 words.`,
  cinema_enthusiast: `You are REEL — the AI entertainment intelligence assistant for Economic Times. Cover Bollywood box office, OTT wars, film industry economics, and streaming trends. Be engaging and pop-culture savvy. Keep replies under 180 words.`,
  sportsperson: `You are ACE — the AI sports intelligence assistant for Economic Times. Cover cricket, IPL, Indian football, sports business, athlete deals, and sports economics. Be energetic and stats-driven. Keep replies under 180 words.`,
  literature_enthusiast: `You are QUILL — the AI literary intelligence assistant for Economic Times. Cover books, publishing industry, Indian authors, awards, and reading culture. Be thoughtful, literary, and insightful. Keep replies under 180 words.`,
  entrepreneur: `You are FORGE — the AI business opportunity assistant for Economic Times. Cover MSMEs, GST, business regulations, market opportunities, and entrepreneurship. Be practical and actionable. Keep replies under 180 words.`,
};

export async function askAI(userMessage, role = "investor", recentArticles = [], conversationHistory = []) {
  const systemPrompt = ROLE_SYSTEM_PROMPTS[role] || ROLE_SYSTEM_PROMPTS.investor;
  let contextBlock = "";
  if (recentArticles.length > 0) {
    const contextLines = recentArticles
      .slice(0, 6)
      .map((a, i) => `[${i + 1}] ${a.title} — ${(a.summary || "").slice(0, 120)}`)
      .join("\n");
    contextBlock = `\n\nLIVE NEWS CONTEXT (just fetched from GNews):\n${contextLines}\n\nUse this real-time context to answer accurately.`;
  }
  const messages = [
    { role: "system", content: systemPrompt + contextBlock },
    ...conversationHistory.slice(-8),
    { role: "user", content: userMessage },
  ];
  return groqChat(messages, { temperature: 0.55, max_tokens: 400 });
}

export async function generateVideoScript(article) {
  const prompt = `You are a broadcast news scriptwriter. Write a 90-second TV news video script.

Article: "${article.title}"
Summary: "${(article.summary || article.description || "").slice(0, 300)}"
Source: ${article.source}

Structure EXACTLY like this (use these exact section headers on their own lines):
[HOOK]
<15-second attention-grabbing opening. Start with a powerful fact or question.>

[MAIN]
<50-second main story narration. Cover the who, what, when, where, why. Include specific numbers/data.>

[CONTEXT]
<20-second market/industry context and implications for viewers.>

[CLOSE]
<5-second memorable sign-off with a forward-looking note.>

Write in broadcast news style — clear, punchy, present tense.`;

  const messages = [
    { role: "system", content: "You are an expert broadcast news scriptwriter for Economic Times. Write only the script." },
    { role: "user", content: prompt },
  ];
  return groqChat(messages, { temperature: 0.6, max_tokens: 700 });
}

export async function generateAvatarGreeting(role, userName, recentArticles = []) {
  const avatarNames = { investor: "ARIA", founder: "NOVA", student: "SAGE", policy_analyst: "NEXUS", cinema_enthusiast: "REEL", sportsperson: "ACE", literature_enthusiast: "QUILL", entrepreneur: "FORGE" };
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  const avatarName = avatarNames[role] || "ARIA";
  let newsHint = recentArticles.length > 0 ? `\nTop story right now: "${recentArticles[0]?.title}"` : "";
  const messages = [
    { role: "system", content: `You are ${avatarName}, an AI news avatar for My ET. Generate a personalized ${timeOfDay} greeting for ${userName}. Be warm, specific, mention 1-2 current news angles relevant to a ${role.replace(/_/g, " ")}. Max 2 sentences.${newsHint}` },
    { role: "user", content: `Say good ${timeOfDay} to ${userName} and share what matters for them today.` },
  ];
  try { return await groqChat(messages, { temperature: 0.8, max_tokens: 120 }); } catch { return null; }
}

export async function analyzeStoryArc(topic, events) {
  const messages = [
    { role: "system", content: "You are a senior economic journalist. Analyze evolving news stories concisely." },
    { role: "user", content: `Story: "${topic}"\nEvents:\n${events.map((e) => `• ${e.date}: ${e.headline}`).join("\n")}\n\nIn 2 sentences: (1) what this means for India's economy, and (2) what to watch next.` },
  ];
  try { return await groqChat(messages, { temperature: 0.5, max_tokens: 150 }); } catch { return null; }
}

export async function enhanceSearchResults(query, articles, role) {
  if (!articles.length) return null;
  const articleList = articles.slice(0, 5).map((a, i) => `${i + 1}. ${a.title}`).join("\n");
  const messages = [
    { role: "system", content: ROLE_SYSTEM_PROMPTS[role] || ROLE_SYSTEM_PROMPTS.investor },
    { role: "user", content: `User searched: "${query}"\n\nRelevant articles:\n${articleList}\n\nIn 2 sentences, summarize what these results reveal and the key insight for a ${role.replace(/_/g, " ")}.` },
  ];
  try { return await groqChat(messages, { temperature: 0.5, max_tokens: 150 }); } catch { return null; }
}

export default { askAI, generateVideoScript, generateAvatarGreeting, analyzeStoryArc, enhanceSearchResults };
