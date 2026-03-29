"""
Avatar Personality Agent — My ET
Generates personalized AI avatar greetings using Groq AI.
Supports all 8 user roles.
"""

import os
import json
import random
import aiohttp
from datetime import datetime
from typing import Optional

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_KEY = os.getenv("GROQ_API_KEY", "")

AVATAR_CONFIGS = {
    "investor":             {"name": "ARIA",  "emoji": "📈", "color": "#F59E0B"},
    "founder":              {"name": "NOVA",  "emoji": "🚀", "color": "#8B5CF6"},
    "student":              {"name": "SAGE",  "emoji": "📚", "color": "#10B981"},
    "policy_analyst":       {"name": "NEXUS", "emoji": "🌍", "color": "#3B82F6"},
    "cinema_enthusiast":    {"name": "REEL",  "emoji": "🎬", "color": "#EC4899"},
    "sportsperson":         {"name": "ACE",   "emoji": "🏏", "color": "#F97316"},
    "literature_enthusiast":{"name": "QUILL", "emoji": "📖", "color": "#6366F1"},
    "entrepreneur":         {"name": "FORGE", "emoji": "⚙️", "color": "#14B8A6"},
}

FALLBACK_GREETINGS = {
    "investor": [
        "Good morning! Markets are showing early volatility — your watchlist needs attention. Nifty futures point to a cautious open. Let me show you what matters most today.",
        "Hello! Banking and IT sectors are driving early momentum. Three of your tracked stocks have major news updates. Your AI briefing is ready.",
        "Morning! RBI commentary is the story of the day. Interest-rate sensitive stocks may see movement. I've prepared your daily impact analysis.",
    ],
    "founder": [
        "Hey! Three fintech startups raised Series B rounds overnight — the ecosystem is buzzing. Your competitor tracker has 2 new moves. Let's dive in!",
        "Good morning, founder! D2C and SaaS sectors are hot right now. I've spotted 5 market gaps worth exploring today.",
        "Rise and build! Two major acquisitions in your sector happened overnight. M&A activity is up 40% this quarter.",
    ],
    "student": [
        "Good morning! Today's top story is about inflation — and it's actually fascinating! I'll explain it with examples you'll remember.",
        "Hey! The Union Budget is all over the news today. Don't worry — I'll break it down step by step.",
        "Morning! Today we'll explore why interest rates matter to everyone, not just bankers. Plus a startup story that'll inspire you!",
    ],
    "policy_analyst": [
        "Good morning. The RBI's monetary policy committee meets today — all signals point to a hold, but the commentary will be crucial.",
        "Good morning. Geopolitical tensions are creating ripple effects in energy policy. India's trade balance data releases today.",
        "Morning brief: The Finance Ministry's new FDI framework changes the landscape for three sectors. Full analysis ready.",
    ],
    "cinema_enthusiast": [
        "Lights, camera, action! Box office numbers are in — a major surprise hit crossed ₹100 crore in 3 days. Your entertainment briefing is live!",
        "Good morning, film lover! OTT wars are heating up — Netflix, Prime, and JioCinema all announced big releases this week.",
        "Hey! Award season is creating buzz — two Indian films are Oscar contenders this year. The entertainment economy is at a record high!",
    ],
    "sportsperson": [
        "Game day! IPL auction results are reshaping team strategies — three unexpected buys could change tournament dynamics. Your sports briefing is ready.",
        "Morning! The Indian cricket team's new sponsorship deal just broke records. Sports business is booming — ₹3,000 crore in deals this month.",
        "Hey champion! The BCCI's latest broadcast rights deal could change how you watch cricket forever. Fantasy league insights just updated!",
    ],
    "literature_enthusiast": [
        "Good morning, reader! The Booker Prize longlist just dropped — three Indian authors made it this year! Your literary digest is ready.",
        "Hello! A major Indian publisher just closed a ₹500 crore deal with an international conglomerate. The publishing world is changing fast.",
        "Morning! Audible India reports 300% growth in regional language audiobooks. The Indian reading renaissance is very much real!",
    ],
    "entrepreneur": [
        "Good morning! New GST simplification rules take effect today — your compliance costs just dropped. Three new business opportunities have opened up.",
        "Hey entrepreneur! The government's MSME credit guarantee scheme just expanded to ₹5 lakh crore. Funding your next phase just got easier.",
        "Morning! Export opportunities in 4 new sectors emerged this week. Plus the PM's Vishwakarma scheme is now accepting applications.",
    ],
}


class AvatarPersonalityAgent:
    """Generates personalized avatar greetings using Groq AI."""

    async def generate(self, role: str, context: str = "greeting", top_article: str = "") -> dict:
        config = AVATAR_CONFIGS.get(role, AVATAR_CONFIGS["investor"])

        try:
            greeting_text = await self._groq_greeting(role, config["name"], top_article)
        except Exception:
            greetings = FALLBACK_GREETINGS.get(role, FALLBACK_GREETINGS["investor"])
            greeting_text = random.choice(greetings)

        return {
            "avatar": config,
            "greeting": greeting_text,
            "timestamp": datetime.utcnow().isoformat(),
            "context": context,
        }

    async def _groq_greeting(self, role: str, avatar_name: str, top_article: str = "") -> str:
        if not GROQ_KEY:
            raise ValueError("No GROQ_API_KEY")

        now = datetime.now().strftime("%A, %B %d at %I:%M %p")
        news_hint = f"\nTop story today: '{top_article}'" if top_article else ""

        messages = [
            {
                "role": "system",
                "content": f"You are {avatar_name}, an AI news avatar for My ET — Economic Times' AI newsroom. Generate a warm, specific, 2-sentence morning greeting for a {role.replace('_', ' ')} user. Include 1 current news angle and what they should focus on today.{news_hint}\n\nCurrent time: {now}",
            },
            {"role": "user", "content": "Generate my personalized greeting."},
        ]

        async with aiohttp.ClientSession() as session:
            payload = {
                "model": GROQ_MODEL,
                "messages": messages,
                "temperature": 0.8,
                "max_tokens": 120,
            }
            headers = {"Content-Type": "application/json", "Authorization": f"Bearer {GROQ_KEY}"}
            async with session.post(GROQ_API_URL, json=payload, headers=headers,
                                     timeout=aiohttp.ClientTimeout(total=15)) as response:
                data = await response.json()
                return data["choices"][0]["message"]["content"].strip()
