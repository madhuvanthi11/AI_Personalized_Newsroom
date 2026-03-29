"""
Breaking News Detection Agent — My ET
Uses Groq AI to classify high-impact news and generate alert messages.
Supports all 8 user roles.
"""

import os
import json
import aiohttp
from typing import Dict, List
from datetime import datetime

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_KEY = os.getenv("GROQ_API_KEY", "")

BREAKING_SYSTEM = """You are a breaking news classifier for Economic Times India.
Analyze this article and respond ONLY with valid JSON (no extra text):
{
  "is_breaking": true,
  "impact_level": "high",
  "alert_message": "Short alert under 15 words",
  "affected_roles": ["investor","founder","student","policy_analyst","cinema_enthusiast","sportsperson","literature_enthusiast","entrepreneur"],
  "category": "markets|policy|startup|global|corporate|sports|entertainment|education"
}

Breaking news = major market move, government policy, RBI decision, corporate event >$100M, IPO, crisis, major award/record."""


class BreakingNewsAgent:
    """Monitors processed articles for breaking news signals using Groq AI."""

    async def detect(self, articles: List[Dict]) -> List[Dict]:
        breaking = []

        # Filter high-impact articles
        high_impact = [a for a in articles if a.get("impact_score", 0) >= 7]

        for article in high_impact[:8]:  # Limit Groq calls
            try:
                result = await self._classify(article)
                if result.get("is_breaking"):
                    result.update({
                        "id": f"bn_{article.get('id', 'x')[:8]}",
                        "article_id": article.get("id"),
                        "source_title": article.get("title", ""),
                        "timestamp": datetime.utcnow().isoformat(),
                        "icon": self._category_icon(result.get("category", "general")),
                        "time": "Just now",
                    })
                    breaking.append(result)
            except Exception as e:
                print(f"[BreakingNewsAgent] Error: {e}")

        return breaking

    async def _classify(self, article: Dict) -> Dict:
        if not GROQ_KEY:
            return self._rule_classify(article)

        content = f"Title: {article.get('title', '')}\nSummary: {article.get('summary', article.get('description', ''))[:400]}"

        async with aiohttp.ClientSession() as session:
            payload = {
                "model": GROQ_MODEL,
                "messages": [
                    {"role": "system", "content": BREAKING_SYSTEM},
                    {"role": "user", "content": content},
                ],
                "temperature": 0.2,
                "max_tokens": 200,
            }
            headers = {"Content-Type": "application/json", "Authorization": f"Bearer {GROQ_KEY}"}
            async with session.post(GROQ_API_URL, json=payload, headers=headers,
                                     timeout=aiohttp.ClientTimeout(total=20)) as response:
                data = await response.json()
                text = data["choices"][0]["message"]["content"].strip()
                if text.startswith("```"):
                    text = text.split("```")[1].lstrip("json").strip()
                start = text.find("{")
                end = text.rfind("}") + 1
                if start >= 0:
                    return json.loads(text[start:end])

        return {"is_breaking": False}

    def _rule_classify(self, article: Dict) -> Dict:
        """Rule-based classification fallback."""
        title = (article.get("title", "") + " " + article.get("summary", "")).lower()
        high_impact = any(k in title for k in ["rbi", "sensex", "nifty", "budget", "ipo", "merger", "acquisition", "rate cut", "rate hike", "gdp"])
        return {
            "is_breaking": high_impact and article.get("impact_score", 0) >= 8,
            "impact_level": "high" if article.get("impact_score", 0) >= 8 else "medium",
            "alert_message": article.get("title", "")[:80],
            "affected_roles": ["investor", "policy_analyst"],
            "category": article.get("category", "general"),
        }

    def _category_icon(self, category: str) -> str:
        icons = {
            "markets": "📉", "policy": "🔴", "startup": "🚀", "global": "🌍",
            "corporate": "🏢", "sports": "🏏", "entertainment": "🎬", "education": "📚",
        }
        return icons.get(category, "🔴")
