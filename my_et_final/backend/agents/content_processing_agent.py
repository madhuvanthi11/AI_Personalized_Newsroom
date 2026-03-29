"""
Content Processing Agent — My ET
Summarizes articles and extracts entities using Groq AI (free, fast)
Falls back to rule-based extraction if Groq key is not set.
"""

import os
import json
import aiohttp
from typing import Dict, List
from datetime import datetime

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_KEY = os.getenv("GROQ_API_KEY", "")

SUMMARY_SYSTEM = """You are a financial news analyst for Economic Times India.
Given a news article, respond ONLY with valid JSON (no markdown, no extra text):
{
  "summary": "2-3 sentence executive summary",
  "key_points": ["point 1", "point 2", "point 3"],
  "entities": {
    "companies": ["list"],
    "people": ["list"],
    "sectors": ["list"],
    "locations": ["list"]
  },
  "sentiment": "positive|negative|neutral",
  "impact_score": 7,
  "tags": ["tag1","tag2","tag3","tag4","tag5"],
  "role_relevance": {
    "investor": 8,
    "founder": 5,
    "student": 6,
    "policy_analyst": 7,
    "cinema_enthusiast": 2,
    "sportsperson": 2,
    "literature_enthusiast": 1,
    "entrepreneur": 5
  }
}"""


class ContentProcessingAgent:
    """
    Uses Groq AI (llama-3.3-70b) to summarize articles and extract metadata.
    Falls back to rule-based extraction if Groq is unavailable.
    """

    async def process(self, article: Dict) -> Dict:
        try:
            if GROQ_KEY:
                enriched = await self._groq_process(article)
                article.update(enriched)
            else:
                article.update(self._rule_based_process(article))
        except Exception as e:
            print(f"[ContentProcessingAgent] Groq failed, using rules: {e}")
            article.update(self._rule_based_process(article))
        return article

    async def _groq_process(self, article: Dict) -> Dict:
        content = f"Title: {article.get('title', '')}\n\nContent: {article.get('raw_content', article.get('description', ''))[:1500]}"

        async with aiohttp.ClientSession() as session:
            payload = {
                "model": GROQ_MODEL,
                "messages": [
                    {"role": "system", "content": SUMMARY_SYSTEM},
                    {"role": "user", "content": content},
                ],
                "temperature": 0.3,
                "max_tokens": 800,
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
                text = data["choices"][0]["message"]["content"].strip()
                # Strip markdown fences if present
                if text.startswith("```"):
                    text = text.split("```")[1]
                    if text.startswith("json"):
                        text = text[4:]
                start = text.find("{")
                end = text.rfind("}") + 1
                if start >= 0 and end > start:
                    return json.loads(text[start:end])

        return self._rule_based_process(article)

    def _rule_based_process(self, article: Dict) -> Dict:
        title = article.get("title", "")
        desc = article.get("description", "")
        text = (title + " " + desc).lower()

        market_kw = ["stock", "market", "nifty", "sensex", "share", "rbi", "rate", "bank", "rupee"]
        startup_kw = ["startup", "funding", "raise", "series", "venture", "ipo", "unicorn"]
        policy_kw = ["policy", "government", "regulation", "budget", "gdp", "inflation", "ministry"]
        cinema_kw = ["film", "movie", "box office", "bollywood", "ott", "cinema", "release", "actor"]
        sports_kw = ["cricket", "ipl", "football", "bcci", "sport", "player", "match", "tournament"]
        lit_kw = ["book", "author", "novel", "publish", "literary", "booker", "literature", "jlf"]
        biz_kw = ["msme", "gst", "business", "export", "entrepreneur", "sme", "artisan"]

        return {
            "summary": desc[:280] if desc else title,
            "key_points": [title],
            "entities": {"companies": [], "people": [], "sectors": [], "locations": []},
            "sentiment": self._detect_sentiment(text),
            "impact_score": 5 + sum([
                2 if any(k in text for k in ["rbi", "budget", "sensex", "ipo"]) else 0,
                1 if any(k in text for k in ["crore", "billion", "record"]) else 0,
            ]),
            "tags": self._extract_tags(title),
            "role_relevance": {
                "investor": 9 if any(k in text for k in market_kw) else 4,
                "founder": 9 if any(k in text for k in startup_kw) else 4,
                "student": 6,
                "policy_analyst": 9 if any(k in text for k in policy_kw) else 4,
                "cinema_enthusiast": 9 if any(k in text for k in cinema_kw) else 2,
                "sportsperson": 9 if any(k in text for k in sports_kw) else 2,
                "literature_enthusiast": 9 if any(k in text for k in lit_kw) else 2,
                "entrepreneur": 9 if any(k in text for k in biz_kw) else 4,
            },
        }

    def _detect_sentiment(self, text: str) -> str:
        pos = ["surge", "rally", "gain", "profit", "rise", "jump", "record", "boost", "growth", "win"]
        neg = ["fall", "drop", "crash", "loss", "decline", "down", "cut", "crisis", "slump", "plunge"]
        p = sum(1 for w in pos if w in text)
        n = sum(1 for w in neg if w in text)
        if p > n:   return "positive"
        if n > p:   return "negative"
        return "neutral"

    def _extract_tags(self, title: str) -> List[str]:
        import re
        words = re.findall(r"\b[A-Z][a-zA-Z]{3,}\b", title)
        unique = list(dict.fromkeys(words))[:5]
        return unique if unique else ["India", "Business"]
