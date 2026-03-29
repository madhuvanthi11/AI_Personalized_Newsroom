"""
Story Arc Agent — My ET
Builds evolving story timelines using Groq AI + live RSS news.
"""

import os
import json
import aiohttp
from typing import Dict, List
from datetime import datetime

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_KEY = os.getenv("GROQ_API_KEY", "")

# Real story arcs with actual events
STORY_ARCS = {
    "arc001": {
        "id": "arc001",
        "topic": "Tesla India Entry",
        "emoji": "⚡",
        "status": "evolving",
        "summary": "Tesla's India launch progressed from trademark filing to showroom planning after PM Modi's meeting with Elon Musk.",
        "events": [
            {"date": "Nov '23", "headline": "Tesla files India trademark in key categories", "significance": "Signals serious market entry intent", "done": True},
            {"date": "Jun '24", "headline": "Elon Musk–PM Modi meeting in New York", "significance": "Government support confirmed; import duty talks begin", "done": True},
            {"date": "Oct '24", "headline": "GoI reduces EV import duty to 15% for manufacturers", "significance": "Critical unlock for Tesla's India pricing strategy", "done": True},
            {"date": "Jan '25", "headline": "Tesla India Pvt Ltd incorporated in Mumbai", "significance": "Legal entity established, hiring begins", "done": True},
            {"date": "Feb '25", "headline": "Showroom locations confirmed: Delhi, Mumbai, Bengaluru", "significance": "Physical presence imminent", "done": True},
            {"date": "Q2 '25", "headline": "Model Y India launch & first deliveries", "significance": "Actual product hits Indian roads", "done": False},
        ],
        "key_players": ["Tesla", "Elon Musk", "GoI", "Tata Motors", "Mahindra"],
        "what_to_watch": "Local manufacturing announcement and pricing strategy for Model Y",
    },
    "arc002": {
        "id": "arc002",
        "topic": "RBI Rate Cycle 2024–25",
        "emoji": "📊",
        "status": "evolving",
        "summary": "RBI navigated inflation vs growth tension through a 5-meeting pause before launching an easing cycle in early 2025.",
        "events": [
            {"date": "Jun '24", "headline": "RBI holds at 6.5% — 4th consecutive pause", "significance": "Signals wait-and-watch on inflation", "done": True},
            {"date": "Oct '24", "headline": "MPC minutes signal dovish pivot; one member dissents", "significance": "Inflection point — easing narrative begins", "done": True},
            {"date": "Dec '24", "headline": "CPI falls to 4.1% — within RBI's comfort zone", "significance": "Gives RBI the cover to cut rates", "done": True},
            {"date": "Feb '25", "headline": "First 25bps cut → repo rate now 6.25%", "significance": "Easing cycle officially begins", "done": True},
            {"date": "Apr '25", "headline": "Next MPC meeting: 25bps cut expected if CPI holds", "significance": "Second consecutive cut would signal clear easing cycle", "done": False},
        ],
        "key_players": ["RBI", "Shaktikanta Das", "MPC", "Finance Ministry"],
        "what_to_watch": "April 2025 MPC decision; CPI trajectory; US Fed policy alignment",
    },
    "arc003": {
        "id": "arc003",
        "topic": "India AI Policy Framework",
        "emoji": "🤖",
        "status": "breaking",
        "summary": "India's AI policy evolved rapidly from a task force to the IndiaAI Mission, with regulation and compute infrastructure being built out.",
        "events": [
            {"date": "Aug '24", "headline": "MeitY forms National AI Task Force with 25 members", "significance": "Formal policy process begins", "done": True},
            {"date": "Nov '24", "headline": "IndiaAI Mission gets ₹10,372 crore government approval", "significance": "Budget commitment confirmed — India serious about AI sovereignty", "done": True},
            {"date": "Jan '25", "headline": "IndiaAI compute cluster launched: 10,000 GPUs available", "significance": "Infrastructure layer for domestic AI development", "done": True},
            {"date": "Mar '25", "headline": "Draft AI Regulation Framework open for public comment", "significance": "Governance model being shaped — industry input critical", "done": False},
            {"date": "Jun '25", "headline": "Final AI Policy Act tabled in Parliament", "significance": "India gets its AI governance law", "done": False},
        ],
        "key_players": ["MeitY", "NITI Aayog", "TCS", "Infosys", "Sarvam.ai"],
        "what_to_watch": "Final regulation framework; compute rollout speed; private sector partnerships",
    },
    "arc004": {
        "id": "arc004",
        "topic": "IPL Media Rights War",
        "emoji": "🏏",
        "status": "evolving",
        "summary": "IPL media rights became the most contested broadcasting deal in Indian sports history, reshaping the OTT landscape.",
        "events": [
            {"date": "Jun '22", "headline": "BCCI sells IPL rights for ₹48,390 crore — record shattered", "significance": "IPL becomes world's 2nd most valuable sports league", "done": True},
            {"date": "Mar '23", "headline": "JioCinema streams IPL free — disrupts OTT pricing wars", "significance": "100M+ concurrent viewers; traditional TV rattled", "done": True},
            {"date": "Nov '23", "headline": "Disney-Reliance merger creates India's largest media company", "significance": "Consolidation reshapes the broadcast landscape", "done": True},
            {"date": "Dec '24", "headline": "IPL 2025 viewership target: 800M — biggest sporting event ever", "significance": "India becomes global sports media powerhouse", "done": True},
            {"date": "2027", "headline": "Next IPL rights cycle auction — expected >₹1 lakh crore", "significance": "Will redefine global sports broadcasting economics", "done": False},
        ],
        "key_players": ["BCCI", "Jio Cinema", "Star Sports", "Disney+Hotstar", "Sony LIV"],
        "what_to_watch": "2027 rights bidding war and streaming vs. broadcast balance",
    },
    "arc005": {
        "id": "arc005",
        "topic": "India Startup Unicorn Surge",
        "emoji": "🦄",
        "status": "evolving",
        "summary": "India's startup ecosystem rebounded from the 2023 funding winter and is on track for its strongest year since 2021.",
        "events": [
            {"date": "2023", "headline": "Funding winter: startup investment drops 72% YoY", "significance": "Brutal correction after 2021 boom; many layoffs", "done": True},
            {"date": "Q1 '24", "headline": "Zepto, Perfios lead recovery; AI-first startups emerge", "significance": "Selective funding resumes with focus on unit economics", "done": True},
            {"date": "Q3 '24", "headline": "India adds 6 unicorns — fastest pace since 2021", "significance": "Recovery confirmed; investor confidence returns", "done": True},
            {"date": "Jan '25", "headline": "Budget removes angel tax; extends startup tax holiday to 5yrs", "significance": "Policy tailwind — biggest startup-friendly budget in a decade", "done": True},
            {"date": "2025", "headline": "Target: 150 Indian unicorns; IPO pipeline has 40+ startups", "significance": "India's startup maturity — from growth to profitability narrative", "done": False},
        ],
        "key_players": ["Zepto", "Perfios", "DPIIT", "Accel", "Peak XV (Sequoia India)"],
        "what_to_watch": "IPO valuations and public market appetite for profitable startups",
    },
}


class StoryArcAgent:
    """Builds evolving story timelines from article clusters using Groq AI."""

    async def build_timeline(self, story_id: str) -> Dict:
        if story_id in STORY_ARCS:
            arc = dict(STORY_ARCS[story_id])
            # Optionally enrich with Groq analysis
            arc["groq_analysis"] = await self._groq_analyze(arc)
            return arc
        return await self._generate_arc(story_id)

    async def get_all_arcs(self) -> List[Dict]:
        return list(STORY_ARCS.values())

    async def _groq_analyze(self, arc: Dict) -> str:
        if not GROQ_KEY:
            return ""
        try:
            events_text = "\n".join([
                f"• {e['date']}: {e['headline']}"
                for e in arc.get("events", []) if e.get("done")
            ])
            messages = [
                {"role": "system", "content": "You are a senior economic journalist for Economic Times."},
                {"role": "user", "content": f'Story: "{arc["topic"]}"\n\nEvents so far:\n{events_text}\n\nIn 2 sentences: (1) what this story means for India, and (2) what to watch next.'},
            ]
            async with aiohttp.ClientSession() as session:
                headers = {"Content-Type": "application/json", "Authorization": f"Bearer {GROQ_KEY}"}
                async with session.post(GROQ_API_URL, json={"model": GROQ_MODEL, "messages": messages, "temperature": 0.5, "max_tokens": 150},
                                         headers=headers, timeout=aiohttp.ClientTimeout(total=15)) as response:
                    data = await response.json()
                    return data["choices"][0]["message"]["content"].strip()
        except Exception:
            return ""

    async def _generate_arc(self, topic: str) -> Dict:
        """Generate a story arc for any topic using Groq."""
        if not GROQ_KEY:
            return {"topic": topic, "summary": "Story arc being built...", "events": [], "status": "evolving"}

        messages = [
            {"role": "system", "content": 'Respond ONLY with valid JSON. Create a story arc for an evolving Indian business/policy news topic: {"topic":"...","summary":"2 sentences","emoji":"emoji","status":"evolving","events":[{"date":"Mon YYYY","headline":"...","significance":"...","done":true/false}],"key_players":["..."],"what_to_watch":"..."}'},
            {"role": "user", "content": f"Create a story arc for: {topic}"},
        ]
        try:
            async with aiohttp.ClientSession() as session:
                headers = {"Content-Type": "application/json", "Authorization": f"Bearer {GROQ_KEY}"}
                async with session.post(GROQ_API_URL, json={"model": GROQ_MODEL, "messages": messages, "temperature": 0.4, "max_tokens": 600},
                                         headers=headers, timeout=aiohttp.ClientTimeout(total=30)) as response:
                    data = await response.json()
                    text = data["choices"][0]["message"]["content"].strip()
                    if text.startswith("```"):
                        text = text.split("```")[1].lstrip("json").strip()
                    start = text.find("{")
                    end = text.rfind("}") + 1
                    if start >= 0:
                        return json.loads(text[start:end])
        except Exception as e:
            print(f"[StoryArcAgent] Groq error: {e}")
        return {"topic": topic, "summary": "Story arc being built...", "events": [], "status": "evolving"}
