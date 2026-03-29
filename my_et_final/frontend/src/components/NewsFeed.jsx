import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { translateArticle } from "../services/translationService";
import VideoStudio from "./VideoStudio";

const SENTIMENT = {
  positive: { color:"text-emerald-400", bg:"bg-emerald-500/10", label:"📈 Positive" },
  negative: { color:"text-red-400", bg:"bg-red-500/10", label:"📉 Negative" },
  neutral: { color:"text-gray-400", bg:"bg-gray-500/10", label:"◼ Neutral" },
};

export default function NewsFeed({ articles, loading, activeTab, tabs, role, onAskAI, avatar, language, searchQuery }) {
  const [expandedId, setExpandedId] = useState(null);
  const [videoArticle, setVideoArticle] = useState(null);
  const [translatedIds, setTranslatedIds] = useState({});
  const [translating, setTranslating] = useState({});

  // Filter by search
  const filtered = searchQuery
    ? articles.filter(a =>
        a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.source?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : articles;

  const handleTranslate = async (article) => {
    if (language === "en") return;
    if (translatedIds[article.id]) { setTranslatedIds(p => { const n={...p}; delete n[article.id]; return n; }); return; }
    setTranslating(p => ({...p, [article.id]:true}));
    try {
      const translated = await translateArticle(article, language);
      setTranslatedIds(p => ({...p, [article.id]:translated}));
    } finally {
      setTranslating(p => ({...p, [article.id]:false}));
    }
  };

  if (loading) return (
    <div className="space-y-4">
      {[1,2,3].map(i => (
        <div key={i} className="bg-gray-900 rounded-2xl p-5 border border-white/5 animate-pulse">
          <div className="h-3 bg-gray-800 rounded w-1/3 mb-3" />
          <div className="h-5 bg-gray-800 rounded w-4/5 mb-2" />
          <div className="h-4 bg-gray-800 rounded w-full mb-1" />
          <div className="h-4 bg-gray-800 rounded w-3/4" />
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="space-y-4">
        {/* AI Briefing banner */}
        <motion.div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-white/10 rounded-2xl p-4 flex items-center gap-3" initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}>
          <div className={`w-10 h-10 ${avatar.avatarBg} rounded-xl flex items-center justify-center text-lg flex-shrink-0`}>{avatar.emoji}</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-0.5">{avatar.name} · AI Daily Briefing</p>
            <p className="text-sm text-white font-medium">
              {searchQuery ? `${filtered.length} results for "${searchQuery}"` : `${filtered.length} curated stories · ${tabs[activeTab]?.label}`}
            </p>
          </div>
          <button onClick={onAskAI} className={`flex-shrink-0 ${avatar.bg} border ${avatar.border} rounded-xl px-3 py-2 text-xs font-medium ${avatar.accent} transition-colors hover:bg-opacity-80`}>
            💬 Ask AI
          </button>
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-3xl mb-2">🔍</p>
            <p className="font-medium">No articles found</p>
            <p className="text-sm mt-1">{searchQuery ? `Try a different search term` : `Loading news from GNews API...`}</p>
          </div>
        )}

        {filtered.map((article, i) => {
          const displayed = translatedIds[article.id] || article;
          const s = SENTIMENT[displayed.sentiment] || SENTIMENT.neutral;
          const expanded = expandedId === article.id;
          return (
            <motion.div key={article.id} className="bg-gray-900 border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-colors"
              initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}>
              <div className="p-5">
                {/* Meta */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-xs font-semibold text-gray-400">{displayed.source}</span>
                  <span className="text-gray-700">·</span>
                  <span className="text-xs text-gray-500">{displayed.time}</span>
                  <span className="text-gray-700">·</span>
                  <span className="text-xs text-gray-500">{displayed.readTime} read</span>
                  {displayed._translated && <span className="text-xs text-amber-400/70 border border-amber-400/20 rounded px-1.5 py-0.5">Translated</span>}
                  <span className={`ml-auto text-xs font-medium px-2.5 py-0.5 rounded-full ${s.bg} ${s.color}`}>{s.label}</span>
                </div>

                {/* Title */}
                {displayed.url ? (
                  <a href={displayed.url} target="_blank" rel="noopener noreferrer" className="block font-bold text-white text-base leading-snug mb-2 hover:text-amber-300 transition-colors cursor-pointer">
                    {displayed.title}
                  </a>
                ) : (
                  <h3 className="font-bold text-white text-base leading-snug mb-2 cursor-pointer hover:text-gray-100" onClick={() => setExpandedId(expanded ? null : article.id)}>
                    {displayed.title}
                  </h3>
                )}

                {/* Tags */}
                <div className="flex gap-1.5 flex-wrap mb-3">
                  {(displayed.tags || []).slice(0,4).map(tag => (
                    <span key={tag} className="text-xs bg-white/5 text-gray-400 rounded-lg px-2.5 py-0.5 border border-white/5">{tag}</span>
                  ))}
                  <span className="text-xs text-gray-600 flex items-center ml-auto">
                    Impact: <span className="font-bold text-amber-400 ml-1">{displayed.impact_score}/10</span>
                  </span>
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {expanded && (
                    <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.25}} className="overflow-hidden">
                      <p className="text-sm text-gray-300 leading-relaxed mb-4">{displayed.summary}</p>
                      {displayed.keyPoints?.length > 0 && (
                        <div className="bg-black/30 rounded-xl p-3 mb-4">
                          <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Key Points</p>
                          <ul className="space-y-1.5">
                            {displayed.keyPoints.map((pt, j) => (
                              <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                                <span className="text-amber-400 mt-0.5 flex-shrink-0">▸</span>{pt}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {displayed.image && (
                        <img src={displayed.image} alt="" className="w-full rounded-xl mb-4 object-cover max-h-40" onError={e=>e.target.style.display="none"} />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setExpandedId(expanded ? null : article.id)}
                    className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl px-3 py-2 transition-colors border border-white/5">
                    {expanded ? "Show less ↑" : "Read more ↓"}
                  </button>
                  <button onClick={() => onAskAI(article.title)}
                    className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl px-3 py-2 transition-colors border border-amber-500/10">
                    💬 Ask AI
                  </button>
                  <button onClick={() => setVideoArticle(article)}
                    className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl px-3 py-2 transition-colors border border-red-500/10">
                    🎬 Video Studio
                  </button>
                  {language !== "en" && (
                    <button onClick={() => handleTranslate(article)} disabled={translating[article.id]}
                      className="text-xs bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 rounded-xl px-3 py-2 transition-colors border border-violet-500/10 disabled:opacity-50">
                      {translating[article.id] ? "Translating..." : translatedIds[article.id] ? "↩ Original" : "🌐 Translate"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Video Studio Modal */}
      <AnimatePresence>
        {videoArticle && (
          <VideoStudio article={videoArticle} avatar={avatar} onClose={() => setVideoArticle(null)} />
        )}
      </AnimatePresence>
    </>
  );
}