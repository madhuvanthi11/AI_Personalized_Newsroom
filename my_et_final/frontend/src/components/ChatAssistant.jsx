/**
 * ChatAssistant.jsx — My ET
 * Groq AI-powered chat with:
 * - Live GNews articles injected as RAG context
 * - Role-specific AI avatar (ARIA / NOVA / SAGE / NEXUS / REEL / ACE / QUILL / FORGE)
 * - Conversation history maintained
 * - Prefill from "Ask AI" buttons on news cards
 */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CHAT_SUGGESTIONS } from "../data/demoData";
import { askAI } from "../services/groqService";

const GROQ_AVAILABLE = !!import.meta.env.VITE_GROQ_API_KEY;

// Fallback responses when no Groq key
const FALLBACK_RESPONSES = {
  investor: [
    "The markets are seeing mixed signals today. Banking stocks are leading gains while IT faces headwinds. The RBI's stance on liquidity will be key.",
    "Based on recent data, Nifty is testing important support levels. FII activity has been net positive this week at ₹2,400 crore.",
    "The current macroeconomic environment suggests rate-sensitive sectors (banking, realty) may outperform in H1 2025 if RBI delivers 50bps in cuts.",
  ],
  founder: [
    "The startup funding landscape looks more positive this quarter. Fintech and SaaS are attracting the most Series A and B capital.",
    "Recent M&A activity suggests strategic buyers are active. Valuations have stabilized after the 2023 correction.",
    "The angel tax removal in Budget 2025 is a meaningful unlock for early-stage funding.",
  ],
  student: [
    "Great question! Think of it this way — the stock market is like a giant auction where people buy and sell ownership stakes in companies.",
    "The Union Budget is essentially the government's annual income and expense plan. It decides how the country's money is collected (taxes) and spent (schools, roads, defence).",
    "Inflation means prices are rising over time. The RBI tries to keep it around 4% — not too high (bad for savings) and not too low (bad for growth).",
  ],
  policy_analyst: [
    "The RBI's current posture reflects a calibrated easing cycle — dovish rhetoric with data-dependent action. April MPC will be crucial.",
    "India's external sector remains resilient despite global headwinds. CAD is projected at 1.5% of GDP for FY25.",
    "The geopolitical realignment is creating new trade corridors for India, particularly in the Middle East and Southeast Asia.",
  ],
  cinema_enthusiast: [
    "Bollywood is seeing a strong box office recovery. Pan-India films and content-driven scripts are outperforming star-driven vehicles.",
    "The OTT landscape is bifurcating — Netflix and Prime focusing on premium originals while JioCinema and Zee5 chase breadth with regional content.",
    "Award season buzz suggests India's cinema is getting serious global recognition, following the RRR and Naatu Naatu moment.",
  ],
  sportsperson: [
    "Cricket's business transformation is accelerating. IPL's per-match value now exceeds the NFL on a per-game basis — extraordinary growth.",
    "India's sports ecosystem is diversifying rapidly. Kabaddi, badminton, and football are finding serious investor interest.",
    "Fantasy sports and sports-tech are creating new economic models around athlete performance.",
  ],
  literature_enthusiast: [
    "Indian literature is having a global moment. Publishers in New York and London are actively scouting Indian voices across genres.",
    "The shift to regional language publishing is creating new market opportunities. Books in Tamil, Telugu, and Hindi are seeing 40%+ growth.",
    "The audiobook format is democratizing access to literature in India — particularly for commuters and regional language readers.",
  ],
  entrepreneur: [
    "The GST simplification for MSMEs is a meaningful regulatory relief. Quarterly filing reduces compliance burden significantly.",
    "Export opportunities in PLI-linked sectors (electronics, pharmaceuticals, textiles) are creating new avenues for small businesses.",
    "The government's ONDC network is leveling the e-commerce playing field for small retailers against large platforms.",
  ],
};

function getFallbackResponse(message, role) {
  const responses = FALLBACK_RESPONSES[role] || FALLBACK_RESPONSES.investor;
  const lower = message.toLowerCase();
  // Try to match topic
  if (lower.includes("market") || lower.includes("stock") || lower.includes("nifty") || lower.includes("sensex"))
    return FALLBACK_RESPONSES.investor[0];
  if (lower.includes("rbi") || lower.includes("rate") || lower.includes("inflation"))
    return FALLBACK_RESPONSES.investor[2];
  if (lower.includes("startup") || lower.includes("funding"))
    return FALLBACK_RESPONSES.founder[0];
  if (lower.includes("budget") || lower.includes("gst") || lower.includes("tax"))
    return FALLBACK_RESPONSES.policy_analyst[0];
  // Return a random role-relevant response
  return responses[Math.floor(Math.random() * responses.length)];
}

export default function ChatAssistant({ open, onToggle, prefill, onPrefillUsed, user, avatar, recentArticles = [] }) {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi ${user.name}! I'm ${avatar.name}, your AI news assistant. I have access to today's live news — ask me anything about markets, business, or current events. Powered by Groq AI.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const [conversationHistory, setConversationHistory] = useState([]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const suggestions = CHAT_SUGGESTIONS[user.role] || CHAT_SUGGESTIONS.investor;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle prefill from news card "Ask AI" buttons
  useEffect(() => {
    if (prefill && open) {
      setInput(prefill);
      onPrefillUsed?.();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [prefill, open]);

  const sendMessage = async (text) => {
    if (!text.trim() || isTyping) return;
    setError("");

    const userMsg = { id: Date.now(), role: "user", content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Build conversation history for multi-turn context
    const newHistory = [...conversationHistory, { role: "user", content: text }];

    try {
      let response;
      if (GROQ_AVAILABLE) {
        response = await askAI(text, user.role, recentArticles, conversationHistory);
      } else {
        // Demo mode: simulate delay + use fallback
        await new Promise((r) => setTimeout(r, 900 + Math.random() * 500));
        response = getFallbackResponse(text, user.role);
      }

      setConversationHistory([...newHistory, { role: "assistant", content: response }]);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: response, timestamp: new Date() },
      ]);
    } catch (e) {
      const errMsg = e.message?.includes("VITE_GROQ_API_KEY")
        ? "Please add VITE_GROQ_API_KEY to your .env file to enable Groq AI."
        : "Network error — using demo response.";
      setError(errMsg);
      const fallback = getFallbackResponse(text, user.role);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: fallback, timestamp: new Date(), isDemo: true },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* ── Toggle button ─────────────────────────────────────────────── */}
      <motion.button
        onClick={onToggle}
        className={`fixed bottom-6 right-6 w-14 h-14 ${avatar.avatarBg} rounded-2xl shadow-2xl flex items-center justify-center z-50 select-none`}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        style={{ boxShadow: `0 0 30px ${avatar.color}50` }}
        title={open ? "Close chat" : `Chat with ${avatar.name}`}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} className="text-white text-lg font-bold">✕</motion.span>
          ) : (
            <motion.span key="icon" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="text-2xl">{avatar.emoji}</motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── Chat panel ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-24 right-6 w-[390px] max-w-[calc(100vw-1.5rem)] bg-gray-900 border border-white/10 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
            style={{ height: "560px" }}
          >
            {/* Header */}
            <div className={`${avatar.bg} border-b border-white/10 px-4 py-3 flex items-center gap-3 flex-shrink-0`}>
              <div className={`w-10 h-10 ${avatar.avatarBg} rounded-xl flex items-center justify-center text-xl relative`}>
                {avatar.emoji}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-white text-sm">{avatar.name}</p>
                <p className={`text-xs ${avatar.accent}`}>
                  {GROQ_AVAILABLE ? "Groq AI · RAG Active · Real-time" : "Demo Mode · Add GROQ key to .env"}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className={`w-2 h-2 ${GROQ_AVAILABLE ? "bg-green-400" : "bg-yellow-400"} rounded-full`} />
                <span className={`text-xs ${GROQ_AVAILABLE ? "text-green-400" : "text-yellow-400"}`}>
                  {GROQ_AVAILABLE ? "AI Live" : "Demo"}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className={`w-7 h-7 ${avatar.avatarBg} rounded-xl flex items-center justify-center text-sm flex-shrink-0 mt-0.5`}>
                      {avatar.emoji}
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? `bg-gradient-to-br ${avatar.gradient} text-white rounded-br-none`
                        : `bg-white/5 text-gray-200 rounded-bl-none ${msg.isDemo ? "border border-yellow-500/20" : ""}`
                    }`}
                  >
                    {msg.content}
                    {msg.isDemo && <span className="block text-xs text-yellow-500/60 mt-1">· Demo response</span>}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2">
                  <div className={`w-7 h-7 ${avatar.avatarBg} rounded-xl flex items-center justify-center text-sm flex-shrink-0`}>
                    {avatar.emoji}
                  </div>
                  <div className="bg-white/5 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1.5 items-center">
                    {[0, 1, 2].map((i) => (
                      <motion.div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                        animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">Groq thinking…</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-xs text-yellow-500/80 bg-yellow-500/5 border border-yellow-500/20 rounded-xl px-3 py-2">
                  ⚠️ {error}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide flex-shrink-0">
                {suggestions.slice(0, 3).map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl px-3 py-1.5 whitespace-nowrap transition-colors flex-shrink-0 border border-white/5"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-white/5 flex-shrink-0">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                  placeholder={`Ask ${avatar.name} about today's news…`}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/40 transition-colors"
                />
                <motion.button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  className={`${avatar.avatarBg} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed`}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
                  </svg>
                </motion.button>
              </div>
              {recentArticles.length > 0 && (
                <p className="text-[10px] text-gray-600 mt-1.5 text-center">
                  {avatar.name} has context from {recentArticles.length} live articles
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
