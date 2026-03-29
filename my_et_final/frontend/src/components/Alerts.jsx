import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export function BreakingNewsAlert({ alert, onDismiss }) {
  const high = alert.impact_level === "high";
  return (
    <motion.div initial={{y:-100,opacity:0}} animate={{y:0,opacity:1}} exit={{y:-100,opacity:0}} transition={{type:"spring",stiffness:300,damping:25}}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[92vw] max-w-2xl rounded-2xl shadow-2xl overflow-hidden`}
      style={{background:high?"linear-gradient(135deg,#dc2626,#ea580c)":"linear-gradient(135deg,#d97706,#ca8a04)"}}>
      <div className="px-4 py-3 flex items-center gap-3">
        <motion.span animate={{scale:[1,1.3,1]}} transition={{duration:0.8,repeat:Infinity}} className="text-xl flex-shrink-0">{alert.icon}</motion.span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-0.5">🔴 Breaking News</p>
          <p className="text-sm font-bold text-white leading-tight truncate">{alert.message}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-white/70 hidden sm:block">{alert.time}</span>
          <button onClick={onDismiss} className="w-7 h-7 bg-black/20 hover:bg-black/40 rounded-lg flex items-center justify-center text-white text-xs transition-colors">✕</button>
        </div>
      </div>
      <motion.div className="h-0.5 bg-white/30" initial={{width:"100%"}} animate={{width:"0%"}} transition={{duration:8,ease:"linear"}} onAnimationComplete={onDismiss} />
    </motion.div>
  );
}

export function NotificationBell({ count, notifications, role }) {
  const [open, setOpen] = useState(false);
  const relevant = notifications.filter(n => n.affected_roles?.includes(role));
  return (
    <div className="relative">
      <button onClick={() => setOpen(v=>!v)} className="relative w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-colors border border-white/5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-300">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {count > 0 && (
          <motion.span initial={{scale:0}} animate={{scale:1}} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            {Math.min(count,9)}
          </motion.span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{opacity:0,y:8,scale:0.96}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,scale:0.96}} transition={{duration:0.15}}
            className="absolute right-0 top-12 w-80 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <p className="font-bold text-white text-sm">Alerts</p>
              <button onClick={()=>setOpen(false)} className="text-gray-500 hover:text-gray-300 text-xs">Close</button>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {relevant.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6">No alerts for your role</p>
              ) : relevant.map(n => (
                <div key={n.id} className="px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors">
                  <div className="flex items-start gap-2">
                    <span className="text-base flex-shrink-0 mt-0.5">{n.icon}</span>
                    <div>
                      <p className="text-sm text-white leading-tight">{n.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}