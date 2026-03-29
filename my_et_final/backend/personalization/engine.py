"""Personalization Engine — My ET"""
from typing import Dict, List
from datetime import datetime
from database.db import Database
from agents.personalization_agent import PersonalizationAgent

WEIGHTS = {"read":3.0,"click":1.5,"search":2.0,"share":4.0,"bookmark":5.0}


class PersonalizationEngine:
    def __init__(self):
        self.db = Database()
        self.agent = PersonalizationAgent()
        self.behavior_store: Dict[str, List] = {}

    async def track_event(self, user_id: str, action: str, entity: str, metadata: Dict):
        self.behavior_store.setdefault(user_id, []).append({
            "action": action, "entity": entity,
            "metadata": metadata, "timestamp": datetime.utcnow().isoformat()
        })

    async def get_feed(self, user_id: str, role: str, articles: List[Dict] = None) -> List[Dict]:
        if articles is None:
            articles = await self.db.get_articles(role=role, limit=20)
        user = await self.db.get_user(user_id) or {"role": role}
        return await self.agent.rank_for_user(user, articles)

    async def get_recommendations(self, user_id: str) -> List[Dict]:
        behavior = self.behavior_store.get(user_id, [])
        scores: Dict[str, float] = {}
        for ev in behavior:
            w = WEIGHTS.get(ev["action"], 1.0)
            scores[ev["entity"]] = scores.get(ev["entity"], 0) + w
        return [{"topic": t, "score": round(s,1)} for t,s in sorted(scores.items(), key=lambda x:x[1], reverse=True)[:10]]
