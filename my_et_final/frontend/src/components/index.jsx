/**
 * components/index.jsx — Shared UI components for My ET
 * Exports: LanguageSwitcher, NotificationBell, BreakingNewsAlert
 */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LANGUAGE_OPTIONS } from "../services/translationService";

// ─── LanguageSwitcher ─────────────────────────────────────────────────────────

export function LanguageSwitcher({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGUAGE_OPTIONS.find((l) => l.code === value) || LANGUAGE_OPTIONS[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm transition-colors"
        title="Change language"
      >
        <span className="font-bold text-white">{current.label}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-500">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1.5 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[200] min-w-[160px]"
          >
            <div className="p-1">
              <p className="text-xs text-gray-500 px-3 py-1.5 font-medium">Choose language</p>
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { onChange(lang.code); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                    value === lang.code ? "bg-amber-500/20 text-amber-400" : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <span className="font-bold w-5 text-center text-base">{lang.label}</span>
                  <span>{lang.native}</span>
                  {value === lang.code && <span className="ml-auto text-amber-400 text-xs">✓</span>}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── NotificationBell ─────────────────────────────────────────────────────────

export function NotificationBell({ count, notifications, role }) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(new Set());
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const active = notifications.filter(
    (n) => n.affected_roles?.includes(role) && !dismissed.has(n.id)
  );
  const visibleCount = active.length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-colors"
        title="Notifications"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-300">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {visibleCount > 0 && (
          <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center"
          >
            {visibleCount > 9 ? "9+" : visibleCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1.5 w-80 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl z-[200] overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <p className="font-bold text-white text-sm">Alerts</p>
              <span className="text-xs text-gray-500">{visibleCount} active</span>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {active.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-500 text-sm">All caught up ✓</div>
              ) : (
                active.map((n) => (
                  <div key={n.id} className="px-4 py-3 border-b border-white/5 hover:bg-white/3 flex gap-3">
                    <span className="text-xl flex-shrink-0 mt-0.5">{n.icon || "🔴"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium leading-snug">{n.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{n.time}</p>
                    </div>
                    <button
                      onClick={() => setDismissed((prev) => new Set([...prev, n.id]))}
                      className="text-gray-600 hover:text-gray-400 text-xs flex-shrink-0"
                    >✕</button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── BreakingNewsAlert ────────────────────────────────────────────────────────

export function BreakingNewsAlert({ alert, onDismiss }) {
  const impactColors = {
    high: "from-red-600 to-red-700",
    medium: "from-orange-600 to-amber-600",
    low: "from-blue-600 to-blue-700",
  };
  const gradColor = impactColors[alert.impact_level] || impactColors.high;

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -80, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r ${gradColor} px-4 py-3 flex items-center gap-3 shadow-2xl`}
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="flex-shrink-0"
      >
        <span className="text-xl">{alert.icon || "🔴"}</span>
      </motion.div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-black text-white/70 uppercase tracking-widest mr-2">
          {alert.impact_level === "high" ? "⚡ BREAKING" : "📢 ALERT"}
        </span>
        <span className="text-sm font-bold text-white">{alert.message}</span>
        <span className="text-xs text-white/60 ml-2">{alert.time}</span>
      </div>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </motion.div>
  );
}
