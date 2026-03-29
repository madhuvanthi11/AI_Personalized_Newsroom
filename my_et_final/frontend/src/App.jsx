/**
 * App.jsx — My ET: AI Personalized Newsroom
 * Root component: manages splash screen, onboarding, and dashboard routing
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem("myET_user");
        if (saved) setUser(JSON.parse(saved));
      } catch {}
      setIsLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const handleOnboard = (userData) => {
    try { localStorage.setItem("myET_user", JSON.stringify(userData)); } catch {}
    setUser(userData);
  };

  const handleLogout = () => {
    try { localStorage.removeItem("myET_user"); } catch {}
    setUser(null);
  };

  if (isLoading) return <SplashScreen />;

  return (
    <AnimatePresence mode="wait">
      {!user ? (
        <OnboardingPage key="onboard" onComplete={handleOnboard} />
      ) : (
        <DashboardPage key={`dashboard-${user.user_id}`} user={user} onLogout={handleLogout} />
      )}
    </AnimatePresence>
  );
}

function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 bg-gray-950 flex flex-col items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center"
      >
        <div className="flex items-center gap-3 mb-4 justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/30">
            <span className="text-2xl font-black text-white">ET</span>
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-black text-white tracking-tight">My ET</h1>
            <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase">AI Newsroom</p>
          </div>
        </div>
        <p className="text-gray-500 text-sm mb-8">Powered by Groq AI + GNews</p>
        <motion.div className="flex gap-1.5 justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i} className="w-2 h-2 bg-amber-400 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
