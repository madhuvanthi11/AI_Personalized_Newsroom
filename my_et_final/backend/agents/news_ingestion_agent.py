"""
News Ingestion Agent — My ET
Fetches real-time news from free RSS feeds for all 8 user roles.
Includes GNews API as primary source and RSS as secondary.
"""

import asyncio
import aiohttp
import feedparser
import hashlib
import os
from datetime import datetime
from typing import List, Dict

GNEWS_KEY = os.getenv("GNEWS_API_KEY", "")
GNEWS_BASE = "https://gnews.io/api/v4"

# RSS feeds (all free, public)
RSS_FEEDS = {
    "markets": [
        "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
        "https://www.moneycontrol.com/rss/marketreports.xml",
        "https://economictimes.indiatimes.com/rssfeedstopstories.cms",
    ],
    "startups": [
        "https://inc42.com/feed/",
        "https://yourstory.com/feed",
        "https://techcrunch.com/feed/",
    ],
    "policy": [
        "https://www.thehindu.com/business/Economy/feeder/default.rss",
        "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3",
    ],
    "business": [
        "https://www.business-standard.com/rss/home_page_top_stories.rss",
        "https://www.livemint.com/rss/homepage",
    ],
    "global": [
        "https://feeds.reuters.com/reuters/businessNews",
    ],
    "sports": [
        "https://sports.ndtv.com/feeds/sports-news.xml",
        "https://www.espncricinfo.com/rss/content/story/feeds/0.xml",
    ],
    "entertainment": [
        "https://www.bollywoodhungama.com/rss/news/",
        "https://www.pinkvilla.com/feed",
    ],
}

# Role → GNews queries
ROLE_GNEWS_QUERIES = {
    "investor":             "India stock market OR Sensex OR Nifty OR RBI OR economy India",
    "founder":              "India startup funding OR venture capital OR unicorn OR IPO India",
    "student":              "India economy OR Union Budget OR GDP India OR education policy",
    "policy_analyst":       "India government policy OR RBI monetary policy OR geopolitics India",
    "cinema_enthusiast":    "Bollywood box office OR OTT streaming India OR Indian cinema 2025",
    "sportsperson":         "India cricket OR IPL 2025 OR Indian football OR sports India",
    "literature_enthusiast":"India books OR Booker Prize OR Indian authors OR publishing India",
    "entrepreneur":         "India MSME OR GST India OR small business OR export promotion India",
}


class NewsIngestionAgent:
    """Fetches real-time news from GNews API and RSS feeds. Deduplicates by URL hash."""

    def __init__(self):
        self.seen_hashes: set = set()

    async def fetch_all_feeds(self, role: str = "investor") -> List[Dict]:
        tasks = []

        # GNews API (primary — real-time, structured)
        if GNEWS_KEY:
            tasks.append(self._fetch_gnews(role))

        # RSS feeds (secondary — free, no limits)
        categories = self._role_to_categories(role)
        for cat in categories:
            for url in RSS_FEEDS.get(cat, []):
                tasks.append(self._fetch_rss(url, cat))

        results = await asyncio.gather(*tasks, return_exceptions=True)
        articles = []
        for r in results:
            if isinstance(r, list):
                articles.extend(r)

        unique = self._deduplicate(articles)
        print(f"[NewsIngestionAgent] {role}: {len(unique)} unique articles")
        return unique

    async def _fetch_gnews(self, role: str) -> List[Dict]:
        query = ROLE_GNEWS_QUERIES.get(role, ROLE_GNEWS_QUERIES["investor"])
        url = f"{GNEWS_BASE}/search?q={query}&lang=en&country=in&max=10&sortby=publishedAt&apikey={GNEWS_KEY}"
        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as session:
                async with session.get(url) as resp:
                    if resp.status != 200:
                        return []
                    data = await resp.json()
                    return [self._map_gnews(a, role) for a in data.get("articles", [])]
        except Exception as e:
            print(f"[NewsIngestionAgent] GNews error: {e}")
            return []

    def _map_gnews(self, a: dict, role: str) -> Dict:
        return {
            "id": self._hash(a.get("url", "") or a.get("title", "")),
            "title": a.get("title", ""),
            "url": a.get("url", ""),
            "description": a.get("description", ""),
            "raw_content": a.get("content", a.get("description", "")),
            "source": a.get("source", {}).get("name", "GNews"),
            "category": role,
            "published": a.get("publishedAt", datetime.utcnow().isoformat()),
            "image": a.get("image"),
        }

    async def _fetch_rss(self, url: str, category: str) -> List[Dict]:
        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=8)) as session:
                async with session.get(url) as resp:
                    content = await resp.text()

            feed = feedparser.parse(content)
            articles = []
            for entry in feed.entries[:10]:
                articles.append({
                    "id": self._hash(entry.get("link", entry.get("title", ""))),
                    "title": entry.get("title", ""),
                    "url": entry.get("link", ""),
                    "description": entry.get("summary", "")[:500],
                    "raw_content": (entry.get("content", [{}])[0].get("value", "") if entry.get("content") else entry.get("summary", ""))[:1000],
                    "source": feed.feed.get("title", url)[:50],
                    "category": category,
                    "published": entry.get("published", datetime.utcnow().isoformat()),
                    "image": None,
                })
            return articles
        except Exception as e:
            print(f"[NewsIngestionAgent] RSS error {url[:40]}: {e}")
            return []

    def _role_to_categories(self, role: str) -> List[str]:
        mapping = {
            "investor": ["markets", "business", "policy"],
            "founder": ["startups", "business", "markets"],
            "student": ["business", "policy"],
            "policy_analyst": ["policy", "global", "business"],
            "cinema_enthusiast": ["entertainment", "business"],
            "sportsperson": ["sports", "business"],
            "literature_enthusiast": ["business"],
            "entrepreneur": ["business", "policy", "startups"],
        }
        return mapping.get(role, ["business"])

    def _hash(self, s: str) -> str:
        return hashlib.md5(s.encode()).hexdigest()[:12]

    def _deduplicate(self, articles: List[Dict]) -> List[Dict]:
        unique = []
        for a in articles:
            h = self._hash(a.get("url", "") or a.get("title", ""))
            if h not in self.seen_hashes:
                self.seen_hashes.add(h)
                unique.append(a)
        return unique
