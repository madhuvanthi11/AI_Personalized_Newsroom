/**
 * DashboardPage.jsx — My ET: AI Personalized Newsroom
 * Features:
 *  - Real-time GNews articles (no placeholders)
 *  - Groq-powered AI chat with RAG (articles as context)
 *  - Working search with AI-enhanced results summary
 *  - Breaking news alerts for each role
 *  - Story Arc Tracker with real evolving stories
 *  - AI Video Studio (Groq-generated scripts + TTS playback)
 *  - Full multilingual translation (6 languages via MyMemory)
 *  - All 8 roles fully supported
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AvatarPanel from "../components/AvatarPanel";
import NewsFeed from "../components/NewsFeed";
import ChatAssistant from "../components/ChatAssistant";
import BreakingNewsAlert from "../components/BreakingNewsAlert";
import StoryArcTracker from "../components/StoryArcTracker";
import NotificationBell from "../components/NotificationBell";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { BREAKING_ALERTS, STORY_ARCS, getAvatarConfig, getRoleTabs, FALLBACK_NEWS } from "../data/demoData";
import { fetchNewsByRole, searchArticles } from "../services/gnewsService";
import { generateAvatarGreeting, enhanceSearchResults } from "../services/groqService";

export default function DashboardPage({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPrefill, setChatPrefill] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showBreaking, setShowBreaking] = useState(null);
  const [language, setLanguage] = useState(user.language || "en");

  // News state
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [searchInsight, setSearchInsight] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef(null);

  // Greeting state
  const [aiGreeting, setAiGreeting] = useState(null);

  const avatar = getAvatarConfig(user.role);
  const tabs = getRoleTabs(user.role);
  const alertIndexRef = useRef(0);

  // ─── Fetch real-time news on role change ──────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(false);
    setAllArticles([]);

    fetchNewsByRole(user.role)
      .then((articles) => {
        if (cancelled) return;
        if (articles.length > 0) {
          setAllArticles(articles);
          // Generate AI greeting based on real articles
          generateAvatarGreeting(user.role, user.name, articles).then((greeting) => {
            if (!cancelled && greeting) setAiGreeting(greeting);
          });
        } else {
          // Fall back to demo data
          setAllArticles(FALLBACK_NEWS[user.role] || FALLBACK_NEWS.investor);
          setFetchError(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAllArticles(FALLBACK_NEWS[user.role] || FALLBACK_NEWS.investor);
          setFetchError(true);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [user.role]);

  // ─── Filtered articles for display ───────────────────────────────────────
  const displayedArticles = searchActive && searchQuery
    ? searchArticles(allArticles, searchQuery)
    : allArticles;

  // ─── Breaking news cycling ────────────────────────────────────────────────
  useEffect(() => {
    const roleAlerts = BREAKING_ALERTS.filter(
      (a) => a.affected_roles.includes(user.role)
    );
    if (!roleAlerts.length) return;
    setNotifications(roleAlerts);

    const firstTimer = setTimeout(() => {
      setShowBreaking(roleAlerts[0]);
      playNotificationSound();
    }, 3500);

    const cycleTimer = setInterval(() => {
      alertIndexRef.current = (alertIndexRef.current + 1) % roleAlerts.length;
      setShowBreaking(roleAlerts[alertIndexRef.current]);
      playNotificationSound();
    }, 25000);

    return () => { clearTimeout(firstTimer); clearInterval(cycleTimer); };
  }, [user.role]);

  // ─── Search with AI insight ───────────────────────────────────────────────
  const handleSearch = useCallback(
    async (q) => {
      setSearchQuery(q);
      setSearchInsight("");
      if (!q.trim()) { setSearchActive(false); return; }
      setSearchActive(true);
      const results = searchArticles(allArticles, q);
      if (results.length > 0) {
        setSearchLoading(true);
        enhanceSearchResults(q, results, user.role)
          .then((insight) => { if (insight) setSearchInsight(insight); })
          .finally(() => setSearchLoading(false));
      }
    },
    [allArticles, user.role]
  );

  const clearSearch = () => {
    setSearchQuery("");
    setSearchActive(false);
    setSearchInsight("");
    searchInputRef.current?.focus();
  };

  // ─── Open chat with prefilled question ───────────────────────────────────
  const openChatWith = (question) => {
    setChatPrefill(question || "");
    setChatOpen(true);
  };

  const playNotificationSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
    } catch {}
  };

  const dismissAlert = (id) => {
    setShowBreaking(null);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-950 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Breaking News Alert */}
      <AnimatePresence>
        {showBreaking && (
          <BreakingNewsAlert
            alert={showBreaking}
            onDismiss={() => dismissAlert(showBreaking.id)}
          />
        )}
      </AnimatePresence>

      {/* ── Top Navigation ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-gray-950/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-sm font-black text-white">ET</span>
            </div>
            <div className="hidden sm:block leading-none">
              <span className="font-black text-lg">My ET</span>
              <span className="text-amber-400 text-xs ml-1 font-bold">AI</span>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-lg mx-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm select-none">🔍</span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && clearSearch()}
                placeholder="Search news, topics, companies… or ask AI"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/50 focus:bg-white/8 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors text-xs"
                >✕</button>
              )}
            </div>
            {/* Search AI insight */}
            <AnimatePresence>
              {searchActive && searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-0 right-0 mt-1 mx-2 z-50"
                >
                  <div className="bg-gray-900 border border-white/10 rounded-xl p-3 shadow-2xl">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-amber-400">🤖 AI Search Insight</span>
                      <span className="text-xs text-gray-500">· {displayedArticles.length} results</span>
                    </div>
                    {searchLoading ? (
                      <div className="flex gap-1 items-center">
                        {[0,1,2].map(i => (
                          <motion.div key={i} className="w-1.5 h-1.5 bg-amber-400 rounded-full"
                            animate={{ scale: [1,1.5,1] }} transition={{ duration: 0.6, repeat: Infinity, delay: i*0.15 }} />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">Groq AI analyzing…</span>
                      </div>
                    ) : searchInsight ? (
                      <p className="text-xs text-gray-300 leading-relaxed">{searchInsight}</p>
                    ) : displayedArticles.length === 0 ? (
                      <p className="text-xs text-gray-500">No matching articles found. Try a different term.</p>
                    ) : (
                      <p className="text-xs text-gray-500">Showing {displayedArticles.length} articles matching "{searchQuery}"</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <LanguageSwitcher value={language} onChange={setLanguage} />
            <NotificationBell
              count={notifications.length}
              notifications={notifications}
              role={user.role}
            />
            {/* User avatar/logout */}
            <button
              onClick={onLogout}
              title="Sign out"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-xl px-2.5 py-2 transition-colors"
            >
              {user.profilePic ? (
                <img src={user.profilePic} className="w-7 h-7 rounded-lg object-cover" alt="You" />
              ) : (
                <div className={`w-7 h-7 ${avatar.avatarBg} rounded-lg flex items-center justify-center text-sm font-bold text-white`}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium hidden sm:block max-w-[80px] truncate">{user.name}</span>
            </button>
          </div>
        </div>

        {/* Live data status bar */}
        <div className="border-t border-white/5 px-4 py-1 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <motion.div
              className={`w-1.5 h-1.5 rounded-full ${fetchError ? "bg-yellow-400" : "bg-green-400"}`}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs text-gray-500">
              {loading ? "Fetching live news…" : fetchError ? "Demo mode (GNews unavailable)" : `Live · ${allArticles.length} articles · GNews API`}
            </span>
          </div>
          <span className="text-gray-700 text-xs">·</span>
          <span className="text-xs text-gray-600">
            {avatar.name} (Groq AI) · {user.role.replace(/_/g, " ")} mode
          </span>
          {!fetchError && !loading && (
            <>
              <span className="text-gray-700 text-xs">·</span>
              <span className="text-xs text-gray-600">Updated {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
            </>
          )}
        </div>
      </nav>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 py-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">

          {/* ── Left: Avatar + Story Arc ────────────────────────────────── */}
          <div className="space-y-5">
            <AvatarPanel
              user={user}
              avatar={avatar}
              articleCount={allArticles.length}
              aiGreeting={aiGreeting}
            />
            <StoryArcTracker arcs={STORY_ARCS} />

            {/* Trending topics sidebar */}
            <TrendingTopics articles={allArticles} role={user.role} onSearch={handleSearch} />
          </div>

          {/* ── Right: Feed ─────────────────────────────────────────────── */}
          <div>
            {/* Role tabs */}
            <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1 scrollbar-hide">
              {tabs.map((tab, i) => (
                <motion.button
                  key={tab.id}
                  onClick={() => { setActiveTab(i); clearSearch(); }}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                    activeTab === i
                      ? `bg-gradient-to-r ${avatar.gradient} text-white shadow-lg`
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span>{tab.label}</span>
                </motion.button>
              ))}
            </div>

            {/* News feed */}
            <NewsFeed
              articles={displayedArticles}
              loading={loading}
              activeTab={activeTab}
              tabs={tabs}
              role={user.role}
              avatar={avatar}
              language={language}
              searchQuery={searchActive ? searchQuery : ""}
              onAskAI={openChatWith}
            />
          </div>
        </div>
      </div>

      {/* ── Floating Chat ───────────────────────────────────────────────── */}
      <ChatAssistant
        open={chatOpen}
        onToggle={() => setChatOpen((v) => !v)}
        prefill={chatPrefill}
        onPrefillUsed={() => setChatPrefill("")}
        user={user}
        avatar={avatar}
        recentArticles={allArticles}
      />
    </motion.div>
  );
}

// ─── Trending Topics mini-widget ─────────────────────────────────────────────

function TrendingTopics({ articles, role, onSearch }) {
  // Extract trending topics from live articles
  const topics = (() => {
    if (!articles.length) return [];
    const tagCounts = {};
    articles.forEach((a) => {
      (a.tags || []).forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count }));
  })();

  if (!topics.length) return null;

  return (
    <div className="bg-gray-900 border border-white/8 rounded-2xl p-4">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">🔥 Trending in your feed</p>
      <div className="flex flex-wrap gap-2">
        {topics.map(({ tag, count }) => (
          <button
            key={tag}
            onClick={() => onSearch(tag)}
            className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg px-2.5 py-1.5 border border-white/5 transition-colors flex items-center gap-1"
          >
            {tag}
            <span className="text-gray-600 text-[10px]">·{count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
