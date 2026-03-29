/**
 * AvatarPanel.jsx — My ET
 * Displays the user's AI avatar with typewriter greeting.
 * Accepts aiGreeting from Groq (real-time) or falls back to static greetings.
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const HOUR = new Date().getHours();
const GREETING = HOUR < 12 ? "Good morning" : HOUR < 18 ? "Good afternoon" : "Good evening";

export default function AvatarPanel({ user, avatar, articleCount = 0, aiGreeting = null }) {
  const [greetingIdx, setGreetingIdx] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [typing, setTyping] = useState(true);
  const [currentSource, setCurrentSource] = useState("static");

  // Cycle through static greetings every 15s if no Groq greeting
  useEffect(() => {
    const t = setInterval(() => {
      if (!aiGreeting) setGreetingIdx((p) => (p + 1) % avatar.greetings.length);
    }, 15000);
    return () => clearInterval(t);
  }, [avatar.greetings.length, aiGreeting]);

  // Typewriter effect — runs whenever the active greeting changes
  const greetingText = aiGreeting || avatar.greetings[greetingIdx];
  useEffect(() => {
    setDisplayedText(""); setTyping(true);
    setCurrentSource(aiGreeting ? "groq" : "static");
    let i = 0;
    const iv = setInterval(() => {
      if (i < greetingText.length) { setDisplayedText(greetingText.slice(0, i + 1)); i++; }
      else { setTyping(false); clearInterval(iv); }
    }, 18);
    return () => clearInterval(iv);
  }, [greetingText]);

  return (
    <motion.div
      className={`${avatar.bg} border ${avatar.border} rounded-3xl p-5 relative overflow-hidden`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ background: `radial-gradient(circle at 30% 30%, ${avatar.color}25, transparent 65%)` }} />

      <div className="relative z-10">
        {/* Avatar header */}
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            className={`w-14 h-14 ${avatar.avatarBg} rounded-2xl flex items-center justify-center text-2xl shadow-lg relative flex-shrink-0`}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {avatar.emoji}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-white text-lg">{avatar.name}</span>
              {currentSource === "groq" && (
                <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded px-1.5 py-0.5 font-bold">GROQ AI</span>
              )}
            </div>
            <p className={`text-xs ${avatar.accent} font-medium`}>Your AI News Avatar</p>
          </div>
          {/* User avatar */}
          {user.profilePic ? (
            <img src={user.profilePic} alt={user.name} className="w-10 h-10 rounded-xl object-cover border-2 border-white/20 flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-lg border border-white/10 flex-shrink-0 font-bold text-white">
              {user.name?.[0]?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Greeting bubble */}
        <div className="bg-black/30 rounded-2xl p-4 mb-4 min-h-[80px]">
          <p className="text-xs text-gray-400 mb-1">{GREETING}, {user.name} 👋</p>
          <p className="text-sm text-white leading-relaxed">
            {displayedText}
            {typing && (
              <motion.span
                className={`inline-block w-0.5 h-4 ${avatar.avatarBg} ml-0.5 align-middle rounded-sm`}
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            )}
          </p>
        </div>

        {/* Stats */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Today's Pulse</p>
          {[
            { label: "Live articles", value: articleCount > 0 ? String(articleCount) : "—", icon: "📰" },
            { label: "AI alerts", value: "8", icon: "🔴" },
            { label: "Story arcs", value: "5", icon: "📅" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between bg-black/20 rounded-xl px-3 py-2">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span>{item.icon}</span>{item.label}
              </div>
              <span className={`font-bold text-sm ${avatar.accent}`}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Role badge */}
        <div className="mt-4 flex items-center justify-center">
          <span className={`text-xs ${avatar.accent} border ${avatar.border} rounded-full px-3 py-1 font-bold tracking-wider uppercase`}>
            {user.role.replace(/_/g, " ")} Mode
          </span>
        </div>
      </div>
    </motion.div>
  );
}
