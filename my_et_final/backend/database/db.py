"""
Database Layer — My ET
SQLite with aiosqlite. Supports all 8 roles.
"""

import aiosqlite
import json
import os
from typing import Dict, List, Optional
from datetime import datetime

DB_PATH = "data/my_et.db"


class Database:
    def __init__(self):
        os.makedirs("data", exist_ok=True)

    async def initialize(self):
        async with aiosqlite.connect(DB_PATH) as db:
            await db.executescript("""
                CREATE TABLE IF NOT EXISTS users (
                    user_id TEXT PRIMARY KEY,
                    name TEXT, role TEXT,
                    avatar_url TEXT, interests TEXT,
                    language TEXT DEFAULT 'en',
                    created_at TEXT, updated_at TEXT
                );
                CREATE TABLE IF NOT EXISTS articles (
                    id TEXT PRIMARY KEY,
                    title TEXT, url TEXT,
                    description TEXT, summary TEXT,
                    source TEXT, category TEXT,
                    sentiment TEXT, impact_score REAL,
                    tags TEXT, role_relevance TEXT,
                    entities TEXT, image TEXT,
                    published TEXT, created_at TEXT
                );
                CREATE TABLE IF NOT EXISTS story_clusters (
                    id TEXT PRIMARY KEY,
                    title TEXT, article_ids TEXT,
                    tags TEXT, created_at TEXT
                );
                CREATE TABLE IF NOT EXISTS breaking_alerts (
                    id TEXT PRIMARY KEY,
                    alert_message TEXT, impact_level TEXT,
                    category TEXT, affected_roles TEXT,
                    article_id TEXT, icon TEXT,
                    timestamp TEXT, is_active INTEGER DEFAULT 1
                );
                CREATE TABLE IF NOT EXISTS user_behavior (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT, action TEXT,
                    entity TEXT, metadata TEXT, timestamp TEXT
                );
                CREATE TABLE IF NOT EXISTS story_arcs (
                    id TEXT PRIMARY KEY,
                    topic TEXT, data TEXT, last_updated TEXT
                );
            """)
            await db.commit()
        print(f"[Database] Initialized at {DB_PATH}")

    async def upsert_user(self, user: Dict):
        now = datetime.utcnow().isoformat()
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute(
                """INSERT OR REPLACE INTO users
                   (user_id,name,role,avatar_url,interests,language,created_at,updated_at)
                   VALUES (?,?,?,?,?,?,COALESCE((SELECT created_at FROM users WHERE user_id=?),?),?)""",
                (user["user_id"], user["name"], user["role"],
                 user.get("avatar_url"), json.dumps(user.get("interests", [])),
                 user.get("language", "en"), user["user_id"], now, now),
            )
            await db.commit()

    async def get_user(self, user_id: str) -> Optional[Dict]:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM users WHERE user_id=?", (user_id,)) as cur:
                row = await cur.fetchone()
                if row:
                    d = dict(row)
                    d["interests"] = json.loads(d.get("interests") or "[]")
                    return d
        return None

    async def save_articles(self, articles: List[Dict]):
        now = datetime.utcnow().isoformat()
        async with aiosqlite.connect(DB_PATH) as db:
            for a in articles:
                await db.execute(
                    """INSERT OR REPLACE INTO articles
                       (id,title,url,description,summary,source,category,
                        sentiment,impact_score,tags,role_relevance,entities,image,published,created_at)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                    (a.get("id"), a.get("title"), a.get("url"),
                     a.get("description"), a.get("summary"), a.get("source"),
                     a.get("category"), a.get("sentiment","neutral"),
                     a.get("impact_score", 5),
                     json.dumps(a.get("tags",[])), json.dumps(a.get("role_relevance",{})),
                     json.dumps(a.get("entities",{})), a.get("image"),
                     a.get("published"), now),
                )
            await db.commit()

    async def get_articles(self, role: str = "investor", page: int = 1, limit: int = 12) -> List[Dict]:
        offset = (page - 1) * limit
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute(
                """SELECT * FROM articles
                   WHERE category=? OR role_relevance LIKE ?
                   ORDER BY impact_score DESC, created_at DESC
                   LIMIT ? OFFSET ?""",
                (role, f'%"{role}"%', limit, offset),
            ) as cur:
                rows = await cur.fetchall()
                results = []
                for row in rows:
                    d = dict(row)
                    d["tags"] = json.loads(d.get("tags") or "[]")
                    d["role_relevance"] = json.loads(d.get("role_relevance") or "{}")
                    d["entities"] = json.loads(d.get("entities") or "{}")
                    results.append(d)
                return results

    async def get_article(self, article_id: str) -> Optional[Dict]:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM articles WHERE id=?", (article_id,)) as cur:
                row = await cur.fetchone()
                if row:
                    d = dict(row)
                    d["tags"] = json.loads(d.get("tags") or "[]")
                    return d
        return None

    async def search_articles(self, query: str, role: str = None, limit: int = 10) -> List[Dict]:
        q = f"%{query}%"
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            sql = "SELECT * FROM articles WHERE (title LIKE ? OR description LIKE ? OR tags LIKE ?) ORDER BY impact_score DESC LIMIT ?"
            params = (q, q, q, limit)
            async with db.execute(sql, params) as cur:
                rows = await cur.fetchall()
                results = []
                for row in rows:
                    d = dict(row)
                    d["tags"] = json.loads(d.get("tags") or "[]")
                    results.append(d)
                return results

    async def save_clusters(self, clusters: List[Dict]):
        now = datetime.utcnow().isoformat()
        async with aiosqlite.connect(DB_PATH) as db:
            for c in clusters:
                await db.execute(
                    "INSERT OR REPLACE INTO story_clusters (id,title,article_ids,tags,created_at) VALUES (?,?,?,?,?)",
                    (c.get("id"), c.get("title"), json.dumps(c.get("article_ids",[])), json.dumps(c.get("tags",[])), now),
                )
            await db.commit()

    async def save_breaking_alerts(self, alerts: List[Dict]):
        async with aiosqlite.connect(DB_PATH) as db:
            for a in alerts:
                await db.execute(
                    """INSERT OR REPLACE INTO breaking_alerts
                       (id,alert_message,impact_level,category,affected_roles,article_id,icon,timestamp,is_active)
                       VALUES (?,?,?,?,?,?,?,?,1)""",
                    (a.get("id"), a.get("alert_message"), a.get("impact_level"),
                     a.get("category"), json.dumps(a.get("affected_roles",[])),
                     a.get("article_id"), a.get("icon","🔴"), a.get("timestamp")),
                )
            await db.commit()

    async def get_trending_topics(self) -> List[Dict]:
        async with aiosqlite.connect(DB_PATH) as db:
            async with db.execute(
                "SELECT tags FROM articles ORDER BY created_at DESC LIMIT 50"
            ) as cur:
                rows = await cur.fetchall()
        counts: Dict[str, int] = {}
        for row in rows:
            tags = json.loads(row[0] or "[]")
            for t in tags:
                counts[t] = counts.get(t, 0) + 1
        sorted_topics = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:10]
        return [{"topic": t, "count": c, "trend": "up"} for t, c in sorted_topics]

    def get_fallback_articles(self, role: str) -> List[Dict]:
        """Minimal fallback when DB is empty and GNews is down."""
        return [
            {"id": f"fb_{role}_1", "title": f"Live {role.replace('_',' ').title()} News Loading…", "summary": "Your personalized news feed is being fetched. Please wait a moment or check your internet connection.", "source": "My ET", "category": role, "sentiment": "neutral", "impact_score": 5, "tags": [role], "published": datetime.utcnow().isoformat()},
        ]
