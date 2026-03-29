import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateVideoScript } from "../services/groqService";

export default function VideoStudio({ article, avatar, onClose }) {
  const [phase, setPhase] = useState("idle"); // idle | generating | ready | playing
  const [script, setScript] = useState(null);
  const [playIdx, setPlayIdx] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  const generate = async () => {
    setPhase("generating");
    try {
      const raw = await generateVideoScript(article);
      // Parse sections
      const sections = [];
      const sectionDefs = [
        { key: "HOOK", label: "Opening Hook", color: "#F59E0B", duration: "0:00–0:15" },
        { key: "MAIN", label: "Main Story", color: "#8B5CF6", duration: "0:15–1:05" },
        { key: "CONTEXT", label: "Context & Analysis", color: "#3B82F6", duration: "1:05–1:25" },
        { key: "CLOSE", label: "Sign-Off", color: "#10B981", duration: "1:25–1:30" },
      ];
      for (const sd of sectionDefs) {
        const regex = new RegExp(`\\[${sd.key}\\]([\\s\\S]*?)(?=\\[|$)`, "i");
        const m = raw.match(regex);
        sections.push({ ...sd, text: m ? m[1].trim() : "" });
      }
      setScript({ raw, sections, title: article.title, source: article.source });
      setPhase("ready");
    } catch (e) {
      console.error("Video studio error:", e);
      setPhase("idle");
      alert("AI script generation failed: " + e.message);
    }
  };

  const speakSection = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.95; utt.pitch = 1; utt.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const en = voices.find(v => v.lang.startsWith("en") && v.name.includes("Google")) || voices.find(v => v.lang.startsWith("en"));
    if (en) utt.voice = en;
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => { setSpeaking(false); if (playIdx < script.sections.length - 1) { setPlayIdx(p => p+1); } else { setPhase("ready"); setPlayIdx(0); } };
    window.speechSynthesis.speak(utt);
    setSpeaking(true);
  };

  const playAll = () => {
    setPhase("playing"); setPlayIdx(0);
    speakSection(script.sections[0].text);
  };

  const stopPlay = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false); setPhase("ready"); setPlayIdx(0);
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <motion.div initial={{scale:0.95,y:20}} animate={{scale:1,y:0}} className="w-full max-w-2xl bg-gray-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900/40 to-orange-900/40 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2" fill="white"/></svg>
            </div>
            <div>
              <p className="font-black text-white text-sm">AI News Video Studio</p>
              <p className="text-xs text-red-400">Groq AI · Broadcast Quality · 90 seconds</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="p-6">
          {/* Article info */}
          <div className="bg-white/5 rounded-2xl p-4 mb-5 border border-white/5">
            <p className="text-xs text-gray-500 mb-1">{article.source} · {article.time}</p>
            <p className="text-sm font-bold text-white leading-snug">{article.title}</p>
          </div>

          {/* State: idle */}
          {phase === "idle" && (
            <div className="text-center py-6">
              <div className="text-5xl mb-4">🎬</div>
              <h3 className="text-white font-bold text-lg mb-2">Transform into Video</h3>
              <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                Groq AI will write a broadcast-quality 90-second narration script with 4 sections: Hook, Story, Context, and Sign-Off.
              </p>
              <div className="grid grid-cols-4 gap-2 mb-6">
                {[{icon:"🎙️",label:"AI Narration"},{icon:"📊",label:"Data Visuals"},{icon:"🗞️",label:"Key Facts"},{icon:"🔊",label:"Text-to-Speech"}].map(f=>(
                  <div key={f.label} className="bg-white/5 rounded-xl p-2 text-center border border-white/5">
                    <p className="text-xl mb-1">{f.icon}</p>
                    <p className="text-xs text-gray-400">{f.label}</p>
                  </div>
                ))}
              </div>
              <button onClick={generate} className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold px-8 py-3 rounded-2xl shadow-lg shadow-red-500/25 hover:opacity-90 transition-opacity">
                Generate Video Script →
              </button>
            </div>
          )}

          {/* State: generating */}
          {phase === "generating" && (
            <div className="text-center py-10">
              <motion.div animate={{rotate:360}} transition={{duration:2,repeat:Infinity,ease:"linear"}} className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full mx-auto mb-4" />
              <p className="text-white font-medium mb-1">Groq AI is writing your script...</p>
              <p className="text-gray-400 text-sm">Generating broadcast-quality narration</p>
            </div>
          )}

          {/* State: ready or playing */}
          {(phase === "ready" || phase === "playing") && script && (
            <div>
              {/* Video player mockup */}
              <div className="relative bg-black rounded-2xl overflow-hidden mb-4 aspect-video flex items-center justify-center border border-white/10">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
                {/* Animated data viz overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div className="w-full h-full p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {phase==="playing"?"🔴 LIVE":"▶ READY"}
                      </div>
                      <div className="text-xs text-gray-400">{script.source}</div>
                    </div>
                    <div className="text-center px-4">
                      <motion.div className={`text-3xl mb-3 ${phase==="playing"&&speaking?"animate-bounce":""}`}>{avatar.emoji}</motion.div>
                      <p className="text-white font-bold text-sm leading-snug mb-2">{script.title}</p>
                      {phase==="playing" && script.sections[playIdx] && (
                        <motion.p key={playIdx} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="text-gray-300 text-xs leading-relaxed">
                          {script.sections[playIdx].text.slice(0,120)}...
                        </motion.p>
                      )}
                    </div>
                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        {phase==="playing" ? <span>{script.sections[playIdx]?.label}</span> : <span>Ready to play</span>}
                        <span>~90 sec</span>
                      </div>
                      <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                        {phase==="playing" && (
                          <motion.div className="h-full bg-red-500 rounded-full" animate={{width:["0%","100%"]}} transition={{duration:22,ease:"linear"}} />
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Script sections */}
              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto" style={{scrollbarWidth:"thin",scrollbarColor:"#374151 transparent"}}>
                {script.sections.map((sec, i) => (
                  <div key={i} className={`rounded-xl p-3 border transition-all ${phase==="playing"&&i===playIdx?"border-white/20 bg-white/10":"border-white/5 bg-white/3"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full" style={{background:sec.color}} />
                      <span className="text-xs font-bold text-gray-300">{sec.label}</span>
                      <span className="text-xs text-gray-600 ml-auto">{sec.duration}</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{sec.text || "..."}</p>
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div className="flex gap-3">
                {phase === "ready" ? (
                  <button onClick={playAll} className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
                    Play with AI Narration
                  </button>
                ) : (
                  <button onClick={stopPlay} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                    Stop
                  </button>
                )}
                <button onClick={generate} className="px-5 bg-white/5 hover:bg-white/10 text-gray-300 font-medium py-3 rounded-2xl transition-colors border border-white/5">
                  Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}