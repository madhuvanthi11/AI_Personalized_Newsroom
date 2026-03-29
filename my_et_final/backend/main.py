"""
My ET — AI Personalized Newsroom
FastAPI Backend (Groq AI + SQLite + RSS/GNews)
"""

import os
import uuid
import json
import asyncio
from datetime import datetime
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from agents.orchestrator import OrchestratorAgent
from rag.pipeline import RAGPipeline
from database.db import Database
from notifications.service import NotificationService
from personalization.engine import PersonalizationEngine

app = FastAPI(
    title="My ET — AI Personalized Newsroom",
    version="2.0.0",
    description="Multi-agent AI newsroom powered by Groq + GNews",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Globals ────────────────────────────────────────────────────────────────────
db = Database()
rag = RAGPipeline()
orchestrator = OrchestratorAgent()
notification_service = NotificationService()
personalization = PersonalizationEngine()

# ── Pydantic models ────────────────────────────────────────────────────────────

class UserProfile(BaseModel):
    user_id: str
    name: str
    role: str
    avatar_url: Optional[str] = None
    interests: List[str] = []
    language: str = "en"

class ChatMessage(BaseModel):
    user_id: str
    message: str
    session_id: Optional[str] = None

class BehaviorEvent(BaseModel):
    user_id: str
    action: str
    entity: str
    metadata: Dict[str, Any] = {}

class TranslateRequest(BaseModel):
    text: str
    target_lang: str
    user_id: Optional[str] = None

# ── Startup ────────────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    await db.initialize()
    await rag.initialize()
    # Kick off background news ingestion for all roles
    asyncio.create_task(orchestrator.run_ingestion_pipeline())
    print("✅ My ET Backend v2 started (Groq AI + GNews)")

# ── Health ─────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "version": "2.0",
        "timestamp": datetime.utcnow().isoformat(),
        "groq": bool(os.getenv("GROQ_API_KEY")),
        "gnews": bool(os.getenv("GNEWS_API_KEY")),
    }

# ── User endpoints ─────────────────────────────────────────────────────────────

@app.post("/api/users/profile")
async def create_or_update_profile(profile: UserProfile):
    await db.upsert_user(profile.model_dump())
    avatar = await orchestrator.run_avatar_personality_agent(profile.role)
    return {"success": True, "avatar": avatar}

@app.get("/api/users/{user_id}/profile")
async def get_profile(user_id: str):
    user = await db.get_user(user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return user

@app.get("/api/users/{user_id}/dashboard")
async def get_dashboard(user_id: str):
    user = await db.get_user(user_id)
    if not user:
        raise HTTPException(404, "User not found")

    role = user["role"]
    articles = await db.get_articles(role=role, limit=15)
    personalized = await personalization.get_feed(user_id, role, articles)
    avatar_greeting = await orchestrator.run_avatar_personality_agent(role, top_article=personalized[0].get("title", "") if personalized else "")
    breaking = await notification_service.get_active_alerts(role)

    return {
        "user": user,
        "feed": personalized,
        "avatar": avatar_greeting,
        "breaking_news": breaking,
        "tabs": _get_role_tabs(role),
    }

# ── News endpoints ─────────────────────────────────────────────────────────────

@app.get("/api/news/feed")
async def get_news_feed(
    role: str = "investor",
    page: int = 1,
    limit: int = 12,
):
    articles = await db.get_articles(role=role, page=page, limit=limit)
    # If DB is empty, trigger ingestion and return fallback
    if not articles:
        asyncio.create_task(orchestrator.run_ingestion_pipeline(roles=[role]))
        articles = db.get_fallback_articles(role)
    return {"articles": articles, "page": page, "role": role}

@app.get("/api/news/search")
async def search_news(q: str = Query(..., min_length=2), role: str = "investor", limit: int = 10):
    articles = await db.search_articles(q, role=role, limit=limit)
    return {"results": articles, "query": q, "count": len(articles)}

@app.get("/api/news/trending")
async def get_trending():
    return await db.get_trending_topics()

@app.get("/api/news/breaking")
async def get_breaking():
    return await notification_service.get_breaking_news()

@app.post("/api/news/ingest")
async def trigger_ingest(background_tasks: BackgroundTasks, role: str = None):
    roles = [role] if role else None
    background_tasks.add_task(orchestrator.run_ingestion_pipeline, roles=roles)
    return {"message": "Ingestion triggered", "roles": roles or "all"}

@app.get("/api/news/{article_id}")
async def get_article(article_id: str):
    article = await db.get_article(article_id)
    if not article:
        raise HTTPException(404, "Article not found")
    return article

@app.get("/api/news/{article_id}/timeline")
async def get_article_timeline(article_id: str):
    return await orchestrator.run_story_arc_agent(article_id)

# ── Story arcs ─────────────────────────────────────────────────────────────────

@app.get("/api/stories/arcs")
async def get_story_arcs():
    return await orchestrator.get_all_story_arcs()

@app.get("/api/stories/{story_id}/arc")
async def get_story_arc(story_id: str):
    return await orchestrator.run_story_arc_agent(story_id)

# ── Chat ───────────────────────────────────────────────────────────────────────

@app.post("/api/chat")
async def chat(msg: ChatMessage):
    if not msg.session_id:
        msg.session_id = str(uuid.uuid4())
    response = await orchestrator.run_conversation_agent(
        user_id=msg.user_id,
        message=msg.message,
        session_id=msg.session_id,
    )
    return {"response": response, "session_id": msg.session_id}

# ── Behavior tracking ─────────────────────────────────────────────────────────

@app.post("/api/behavior/track")
async def track_behavior(event: BehaviorEvent):
    await personalization.track_event(
        user_id=event.user_id,
        action=event.action,
        entity=event.entity,
        metadata=event.metadata,
    )
    return {"success": True}

@app.get("/api/users/{user_id}/recommendations")
async def get_recommendations(user_id: str):
    recs = await personalization.get_recommendations(user_id)
    return {"recommendations": recs}

# ── Notifications ─────────────────────────────────────────────────────────────

@app.get("/api/notifications/{user_id}")
async def get_notifications(user_id: str):
    user = await db.get_user(user_id)
    role = user["role"] if user else "investor"
    alerts = await notification_service.get_alerts_for_user(user_id, role)
    return {"alerts": alerts}

@app.post("/api/notifications/{alert_id}/dismiss")
async def dismiss_notification(alert_id: str, user_id: str):
    await notification_service.dismiss_alert(user_id, alert_id)
    return {"success": True}

# ── Avatar ────────────────────────────────────────────────────────────────────

@app.get("/api/avatar/{user_id}/greeting")
async def get_avatar_greeting(user_id: str):
    user = await db.get_user(user_id)
    role = user["role"] if user else "investor"
    return await orchestrator.run_avatar_personality_agent(role, context="greeting")

# ── Translation ───────────────────────────────────────────────────────────────

@app.post("/api/translate")
async def translate(req: TranslateRequest):
    translated = await orchestrator.run_localization_agent(req.text, req.target_lang)
    return {"translated": translated, "language": req.target_lang}

# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_role_tabs(role: str) -> List[Dict]:
    tabs_map = {
        "investor":             [{"id":"portfolio","label":"Portfolio Impact","icon":"📈"},{"id":"market","label":"Market Movers","icon":"🚀"},{"id":"sector","label":"Sector Trends","icon":"🏭"},{"id":"economic","label":"Economic Signals","icon":"📊"},{"id":"briefings","label":"AI Briefings","icon":"🤖"}],
        "founder":              [{"id":"funding","label":"Startup Funding","icon":"💰"},{"id":"competitors","label":"Competitor Watch","icon":"🔍"},{"id":"opportunities","label":"Market Gaps","icon":"🌱"},{"id":"deals","label":"M&A Deals","icon":"🤝"}],
        "student":              [{"id":"explained","label":"News Explained","icon":"📚"},{"id":"learn","label":"Learn Business","icon":"🎓"},{"id":"concepts","label":"Concepts","icon":"💡"},{"id":"quiz","label":"Quiz","icon":"❓"}],
        "policy_analyst":       [{"id":"policy","label":"Policy Tracker","icon":"📋"},{"id":"global","label":"Global Economy","icon":"🌍"},{"id":"regulations","label":"Regulations","icon":"⚖️"},{"id":"geopolitics","label":"Geopolitics","icon":"🗺️"}],
        "cinema_enthusiast":    [{"id":"boxoffice","label":"Box Office","icon":"🎬"},{"id":"ott","label":"OTT Streaming","icon":"📺"},{"id":"awards","label":"Awards","icon":"🏆"},{"id":"industry","label":"Film Industry","icon":"🎥"}],
        "sportsperson":         [{"id":"cricket","label":"Cricket & IPL","icon":"🏏"},{"id":"football","label":"Football","icon":"⚽"},{"id":"business","label":"Sports Business","icon":"💼"},{"id":"athlete","label":"Athlete News","icon":"🥇"}],
        "literature_enthusiast":[{"id":"books","label":"New Releases","icon":"📖"},{"id":"awards","label":"Awards","icon":"🏆"},{"id":"publishing","label":"Publishing Biz","icon":"🏢"},{"id":"authors","label":"Authors","icon":"✍️"}],
        "entrepreneur":         [{"id":"opportunities","label":"Opportunities","icon":"🌱"},{"id":"policy","label":"Policy & GST","icon":"📋"},{"id":"funding","label":"MSME Funding","icon":"💰"},{"id":"market","label":"Market Entry","icon":"🚪"}],
    }
    return tabs_map.get(role, tabs_map["investor"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
