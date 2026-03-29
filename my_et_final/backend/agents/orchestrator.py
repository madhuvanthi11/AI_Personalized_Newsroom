"""
Orchestrator Agent — My ET
Central coordinator for all specialized agents.
Routes tasks and aggregates results.
"""

import asyncio
from typing import AsyncIterator, Optional, List, Dict

from agents.news_ingestion_agent import NewsIngestionAgent
from agents.content_processing_agent import ContentProcessingAgent
from agents.story_clustering_agent import StoryClusteringAgent
from agents.user_profile_agent import UserProfileAgent
from agents.avatar_personality_agent import AvatarPersonalityAgent
from agents.personalization_agent import PersonalizationAgent
from agents.conversation_agent import ConversationAgent
from agents.breaking_news_agent import BreakingNewsAgent
from agents.story_arc_agent import StoryArcAgent
from agents.localization_agent import LocalizationAgent
from rag.pipeline import RAGPipeline
from database.db import Database

ALL_ROLES = [
    "investor", "founder", "student", "policy_analyst",
    "cinema_enthusiast", "sportsperson", "literature_enthusiast", "entrepreneur",
]


class OrchestratorAgent:
    def __init__(self):
        self.db = Database()
        self.rag = RAGPipeline()

        self.news_ingestion   = NewsIngestionAgent()
        self.content_processor = ContentProcessingAgent()
        self.story_clusterer  = StoryClusteringAgent()
        self.user_profile     = UserProfileAgent()
        self.avatar           = AvatarPersonalityAgent()
        self.personalization  = PersonalizationAgent()
        self.conversation     = ConversationAgent(rag=self.rag)
        self.breaking_news    = BreakingNewsAgent()
        self.story_arc        = StoryArcAgent()
        self.localization     = LocalizationAgent()

        print("🤖 Orchestrator initialized — all agents ready (Groq AI powered)")

    async def run_ingestion_pipeline(self, force_refresh: bool = False, roles: List[str] = None) -> Dict:
        """Full pipeline: fetch → process → cluster → index → save"""
        target_roles = roles or ALL_ROLES
        total_articles, total_breaking = 0, 0

        for role in target_roles:
            try:
                raw = await self.news_ingestion.fetch_all_feeds(role=role)
                if not raw:
                    continue

                # Process with Groq
                processed = []
                for article in raw[:20]:  # Cap to avoid too many Groq calls
                    enriched = await self.content_processor.process(article)
                    processed.append(enriched)

                # Cluster + detect breaking
                clusters = await self.story_clusterer.cluster(processed)
                breaking = await self.breaking_news.detect(processed)

                # Index into RAG
                await self.rag.index_articles(processed)

                # Persist
                await self.db.save_articles(processed)
                await self.db.save_clusters(clusters)
                if breaking:
                    await self.db.save_breaking_alerts(breaking)

                total_articles += len(processed)
                total_breaking += len(breaking)
                print(f"  ✅ {role}: {len(processed)} articles, {len(breaking)} breaking")

            except Exception as e:
                print(f"  ❌ {role} ingestion error: {e}")

        return {"articles": total_articles, "breaking": total_breaking, "roles": target_roles}

    async def run_avatar_personality_agent(self, role: str, context: str = "greeting", top_article: str = "") -> Dict:
        return await self.avatar.generate(role=role, context=context, top_article=top_article)

    async def run_conversation_agent(self, user_id: str, message: str, session_id: str) -> str:
        user = await self.db.get_user(user_id)
        role = user.get("role", "investor") if user else "investor"
        return await self.conversation.respond(
            user_id=user_id, message=message, session_id=session_id, role=role
        )

    async def run_story_arc_agent(self, story_id: str) -> Dict:
        return await self.story_arc.build_timeline(story_id)

    async def get_all_story_arcs(self) -> List[Dict]:
        return await self.story_arc.get_all_arcs()

    async def run_localization_agent(self, text: str, target_lang: str) -> str:
        return await self.localization.translate(text, target_lang)
