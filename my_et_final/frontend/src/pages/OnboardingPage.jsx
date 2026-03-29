/**
 * OnboardingPage.jsx — My ET
 * 3-step onboarding: Welcome → Choose Role → Enter Name
 * Supports all 8 roles
 */
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ROLES = [
  { id: "investor",             label: "Investor",              emoji: "📈", description: "Markets, portfolio impact & sector intelligence", color: "from-amber-500 to-orange-500", bg: "bg-amber-500/10", border: "border-amber-500/30", accent: "text-amber-400",   avatarName: "ARIA",  avatarColor: "bg-amber-500" },
  { id: "founder",              label: "Startup Founder",       emoji: "🚀", description: "Funding rounds, competitor moves & market gaps",  color: "from-violet-500 to-purple-600", bg: "bg-violet-500/10", border: "border-violet-500/30", accent: "text-violet-400", avatarName: "NOVA",  avatarColor: "bg-violet-500" },
  { id: "student",              label: "Student",               emoji: "📚", description: "Simplified news, business concepts & learning",  color: "from-emerald-500 to-teal-500",  bg: "bg-emerald-500/10", border: "border-emerald-500/30", accent: "text-emerald-400",avatarName: "SAGE",  avatarColor: "bg-emerald-500" },
  { id: "policy_analyst",       label: "Policy Analyst",        emoji: "🌍", description: "Policy shifts, geopolitics & macro signals",     color: "from-blue-500 to-cyan-500",     bg: "bg-blue-500/10",    border: "border-blue-500/30",    accent: "text-blue-400",   avatarName: "NEXUS", avatarColor: "bg-blue-500" },
  { id: "cinema_enthusiast",    label: "Cinema Enthusiast",     emoji: "🎬", description: "Box office, OTT wars, awards & film industry",   color: "from-pink-500 to-rose-500",     bg: "bg-pink-500/10",    border: "border-pink-500/30",    accent: "text-pink-400",   avatarName: "REEL",  avatarColor: "bg-pink-500" },
  { id: "sportsperson",         label: "Sports Fan",            emoji: "🏏", description: "Cricket, IPL, athlete news & sports business",   color: "from-orange-500 to-red-500",    bg: "bg-orange-500/10",  border: "border-orange-500/30",  accent: "text-orange-400", avatarName: "ACE",   avatarColor: "bg-orange-500" },
  { id: "literature_enthusiast",label: "Literature Enthusiast", emoji: "📖", description: "Books, awards, authors & publishing industry",   color: "from-indigo-500 to-purple-500", bg: "bg-indigo-500/10",  border: "border-indigo-500/30",  accent: "text-indigo-400", avatarName: "QUILL", avatarColor: "bg-indigo-500" },
  { id: "entrepreneur",         label: "Entrepreneur",          emoji: "⚙️", description: "MSME policy, GST updates & market opportunities",color: "from-teal-500 to-cyan-600",     bg: "bg-teal-500/10",    border: "border-teal-500/30",    accent: "text-teal-400",   avatarName: "FORGE", avatarColor: "bg-teal-500" },
];

export default function OnboardingPage({ onComplete }) {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [name, setName] = useState("");
  const nameRef = useRef(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep(3);
    setTimeout(() => nameRef.current?.focus(), 150);
  };

  const handleComplete = () => {
    if (!name.trim()) return;
    onComplete({
      user_id: `user_${Date.now()}`,
      name: name.trim(),
      role: selectedRole.id,
      avatar_url: null,
      interests: [],
      language: "en",
    });
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-950 text-white overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.4 }}
    >
      {/* Ambient bg */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3 mb-10"
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <span className="text-xl font-black text-white">ET</span>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">My ET</h1>
            <p className="text-xs text-amber-400 tracking-widest uppercase font-semibold">AI Personalized Newsroom</p>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ── Step 1: Welcome ── */}
          {step === 1 && (
            <motion.div key="welcome"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-xl"
            >
              <h2 className="text-4xl font-black mb-4 leading-tight">
                Your news,{" "}
                <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  reimagined by AI.
                </span>
              </h2>
              <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                A real-time multi-agent AI system that fetches live news and personalizes it to your role — with a dedicated AI avatar, Groq-powered chat, and conversational intelligence.
              </p>
              <div className="grid grid-cols-4 gap-3 mb-10">
                {[
                  { icon: "🤖", label: "8 AI Avatars" },
                  { icon: "⚡", label: "Live News" },
                  { icon: "💬", label: "Groq Chat" },
                  { icon: "🎬", label: "AI Video" },
                ].map((f) => (
                  <div key={f.label} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="text-2xl mb-2">{f.icon}</div>
                    <p className="text-xs text-gray-300 font-medium">{f.label}</p>
                  </div>
                ))}
              </div>
              <motion.button
                onClick={() => setStep(2)}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-10 py-4 rounded-2xl text-lg shadow-lg shadow-amber-500/25"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              >
                Get Started →
              </motion.button>
            </motion.div>
          )}

          {/* ── Step 2: Role selection ── */}
          {step === 2 && (
            <motion.div key="role"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-3xl"
            >
              <h2 className="text-3xl font-black text-center mb-2">Who are you?</h2>
              <p className="text-gray-400 text-center mb-7">Choose your role — your AI avatar and live news feed will adapt instantly</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ROLES.map((role, i) => (
                  <motion.button
                    key={role.id}
                    onClick={() => handleRoleSelect(role)}
                    className={`${role.bg} border ${role.border} rounded-2xl p-4 text-left transition-all group hover:scale-[1.03] hover:shadow-lg`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="text-2xl mb-2">{role.emoji}</div>
                    <h3 className="font-bold text-white text-sm leading-tight mb-1">{role.label}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed hidden sm:block">{role.description}</p>
                    <div className={`mt-2 text-[10px] font-bold ${role.accent} tracking-wider uppercase`}>
                      {role.avatarName} →
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Name entry ── */}
          {step === 3 && selectedRole && (
            <motion.div key="name"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md text-center"
            >
              <div className={`w-20 h-20 ${selectedRole.avatarColor} rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5 shadow-2xl`}>
                {selectedRole.emoji}
              </div>
              <h2 className="text-3xl font-black mb-1">Meet {selectedRole.avatarName}</h2>
              <p className={`${selectedRole.accent} font-medium mb-7`}>
                Your personal AI news avatar for {selectedRole.label.toLowerCase()}s
              </p>
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-5 text-left">
                <label className="text-sm text-gray-400 font-medium block mb-2">Your name</label>
                <input
                  ref={nameRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleComplete()}
                  placeholder="Enter your name…"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
              <motion.button
                onClick={handleComplete}
                disabled={!name.trim()}
                className={`w-full bg-gradient-to-r ${selectedRole.color} text-white font-bold py-4 rounded-2xl text-lg disabled:opacity-40 disabled:cursor-not-allowed shadow-lg`}
                whileHover={name.trim() ? { scale: 1.02 } : {}}
                whileTap={name.trim() ? { scale: 0.98 } : {}}
              >
                Launch My Newsroom →
              </motion.button>
              <button
                onClick={() => setStep(2)}
                className="mt-4 text-gray-500 text-sm hover:text-gray-300 transition-colors"
              >
                ← Choose different role
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
