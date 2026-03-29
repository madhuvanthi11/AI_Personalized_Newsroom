/**
 * StoryArcTracker.jsx — My ET
 * Shows 5 real evolving stories with full event timelines
 * Groq AI-generated analysis on click
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeStoryArc } from "../services/groqService";

export default function StoryArcTracker({ arcs }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState({});
  const [analyzing, setAnalyzing] = useState(false);

  const arc = arcs[activeIdx];
  const done = arc.events.filter((e) => e.done).length;
  const pct = Math.round((done / arc.events.length) * 100);

  const handleAnalyze = async () => {
    if (aiAnalysis[arc.id] || analyzing) return;
    setAnalyzing(true);
    try {
      const analysis = await analyzeStoryArc(arc.topic, arc.events.filter((e) => e.done));
      if (analysis) setAiAnalysis((prev) => ({ ...prev, [arc.id]: analysis }));
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-white/8 rounded-3xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">📅 Story Arc Tracker</p>
          <p className="text-sm font-bold text-white mt-0.5">Evolving Stories</p>
        </div>
        <div className="flex gap-1">
          {arcs.map((a, i) => (
            <button key={i} onClick={() => setActiveIdx(i)}
              className={`h-2 rounded-full transition-all duration-200 ${i === activeIdx ? "w-5 bg-amber-400" : "w-2 bg-gray-700 hover:bg-gray-600"}`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={arc.id}
          initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Arc header */}
          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl flex-shrink-0">{arc.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm leading-tight">{arc.topic}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{arc.summary}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${arc.status === "breaking" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}`}>
                  {arc.status === "breaking" ? "🔴 Breaking" : "📡 Evolving"}
                </span>
                <span className="text-xs text-gray-600">{done}/{arc.events.length} events</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-gray-800 rounded-full mb-4 overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
              initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>

          {/* Timeline events */}
          <div className="space-y-0 max-h-52 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "#374151 transparent" }}>
            {arc.events.map((ev, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${ev.done ? "bg-amber-400 shadow-sm shadow-amber-400/50" : "bg-gray-700 border border-gray-600"}`} />
                  {i < arc.events.length - 1 && (
                    <div className={`w-0.5 flex-1 my-0.5 ${ev.done ? "bg-amber-400/30" : "bg-gray-800"}`} style={{ minHeight: "14px" }} />
                  )}
                </div>
                <div className="pb-3 flex-1 min-w-0">
                  <p className={`text-xs font-semibold mb-0.5 ${ev.done ? "text-amber-400" : "text-gray-600"}`}>{ev.date}</p>
                  <p className={`text-xs leading-relaxed ${ev.done ? "text-gray-300" : "text-gray-600"}`}>{ev.headline}</p>
                </div>
              </div>
            ))}
          </div>

          {/* AI Analysis section */}
          <div className="mt-3 pt-3 border-t border-white/5">
            {aiAnalysis[arc.id] ? (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                <p className="text-xs text-amber-400 font-semibold mb-1">🤖 Groq AI Analysis</p>
                <p className="text-xs text-gray-300 leading-relaxed">{aiAnalysis[arc.id]}</p>
              </div>
            ) : (
              <button
                onClick={handleAnalyze}
                disabled={analyzing || !import.meta.env.VITE_GROQ_API_KEY}
                className="w-full text-xs bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/20 text-gray-400 hover:text-amber-400 rounded-xl px-3 py-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {analyzing ? (
                  <>
                    <motion.div className="w-3 h-3 border-2 border-amber-400/30 border-t-amber-400 rounded-full"
                      animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                    Groq AI analyzing…
                  </>
                ) : (
                  <>🤖 Analyze with Groq AI</>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
