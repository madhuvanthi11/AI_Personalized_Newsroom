"""
Conversation Agent — My ET
RAG-powered chatbot using Groq AI (llama-3.3-70b-versatile)
Retrieves relevant news context and generates precise, role-adapted responses.
"""

import os
import json
import aiohttp
from typing import AsyncIterator, Dict, List, Optional

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_KEY = os.getenv("GROQ_API_KEY", "")

ROLE_SYSTEM_PROMPTS = {
    "investor": "You are ARIA — Advanced Returns & Intelligence Assistant — an expert financial AI for Economic Times. Specialize in Indian stock markets, RBI policy, FII/DII flows, sector analysis. Be precise, cite numbers, explain market implications. Keep replies under 200 words.",
    "founder": "You are NOVA — Network & Opportunities Venture Assistant — a startup ecosystem AI for Economic Times. Specialize in Indian startup funding, VC trends, M&A, market gaps. Be energetic, strategic, and actionable. Keep replies under 200 words.",
    "student": "You are SAGE — Student Advisory & Growth Engine — a friendly business education AI. Explain complex financial news simply with Indian examples. Use analogies. Be encouraging. Keep replies under 200 words.",
    "policy_analyst": "You are NEXUS — National & Economic Xpert for Understanding Signals — a macro policy AI. Specialize in RBI, Finance Ministry, geopolitics, regulations. Be precise and formal. Keep replies under 200 words.",
    "cinema_enthusiast": "You are REEL — the AI entertainment intelligence assistant. Cover Bollywood box office, OTT streaming, film industry economics. Be engaging and pop-culture savvy. Keep replies under 200 words.",
    "sportsperson": "You are ACE — the AI sports intelligence assistant. Cover cricket, IPL, Indian sports business, athlete deals. Be energetic and stats-driven. Keep replies under 200 words.",
    "literature_enthusiast": "You are QUILL — the AI literary intelligence assistant. Cover books, publishing, Indian authors, literary awards. Be thoughtful and insightful. Keep replies under 200 words.",
    "entrepreneur": "You are FORGE — the AI business opportunity assistant. Cover MSMEs, GST, regulations, market opportunities. Be practical and actionable. Keep replies under 200 words.",
}


class ConversationAgent:
    """
    RAG-powered conversational agent using Groq AI.
    Injects live news articles as context for accurate, real-time answers.
    """

    def __init__(self, rag=None):
        self.rag = rag
        self.sessions: Dict[str, List[Dict]] = {}

    async def respond(
        self,
        user_id: str,
        message: str,
        session_id: str,
        role: str = "investor",
    ) -> str:
        # Retrieve relevant context
        context_docs = []
        if self.rag:
            try:
                context_docs = await self.rag.retrieve(message, top_k=5)
            except Exception:
                pass

        context_text = self._format_context(context_docs)
        system_prompt = ROLE_SYSTEM_PROMPTS.get(role, ROLE_SYSTEM_PROMPTS["investor"])

        if context_text:
            system_prompt += f"\n\nLIVE NEWS CONTEXT:\n{context_text}\n\nUse this real-time context to answer accurately."

        # Build messages with history
        history = self._get_history(session_id)
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(history[-8:])  # Last 4 exchanges
        messages.append({"role": "user", "content": message})

        try:
            response = await self._call_groq(messages)
        except Exception as e:
            print(f"[ConversationAgent] Groq error: {e}")
            response = self._fallback_response(message, role)

        # Update session history
        self._update_history(
            session_id,
            {"role": "user", "content": message},
            {"role": "assistant", "content": response},
        )
        return response

    async def _call_groq(self, messages: List[Dict]) -> str:
        if not GROQ_KEY:
            raise ValueError("GROQ_API_KEY not set")

        async with aiohttp.ClientSession() as session:
            payload = {
                "model": GROQ_MODEL,
                "messages": messages,
                "temperature": 0.55,
                "max_tokens": 400,
            }
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {GROQ_KEY}",
            }
            async with session.post(
                GROQ_API_URL,
                json=payload,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=25),
            ) as response:
                data = await response.json()
                return data["choices"][0]["message"]["content"].strip()

    def _format_context(self, docs: List[Dict]) -> str:
        if not docs:
            return ""
        parts = []
        for i, doc in enumerate(docs, 1):
            parts.append(f"[{i}] {doc.get('title', 'Article')}: {doc.get('summary', doc.get('description', ''))[:250]}")
        return "\n".join(parts)

    def _get_history(self, session_id: str) -> List[Dict]:
        return self.sessions.get(session_id, [])

    def _update_history(self, session_id: str, *messages):
        if session_id not in self.sessions:
            self.sessions[session_id] = []
        for msg in messages:
            self.sessions[session_id].append(msg)
        self.sessions[session_id] = self.sessions[session_id][-20:]

    def _fallback_response(self, message: str, role: str) -> str:
        lower = message.lower()
        if any(k in lower for k in ["market", "stock", "nifty", "sensex"]):
            return "Markets are showing mixed signals. Banking stocks are resilient while IT faces valuation pressure. Keep an eye on FII flow data for direction."
        if any(k in lower for k in ["rbi", "rate", "inflation"]):
            return "The RBI's easing cycle is underway. The repo rate currently stands at 6.25% after the February 2025 cut. Next MPC meeting in April is key."
        if any(k in lower for k in ["startup", "funding", "unicorn"]):
            return "India's startup ecosystem is recovering well from the 2023 funding winter. Q1 2025 saw $2.1B in venture investment, with fintech and AI-first startups leading."
        return "I'm analyzing the latest news to provide you with relevant insights. Please check your personalized feed for the most recent updates on this topic."
