"""User Profile Agent — My ET"""
from typing import Dict
from datetime import datetime


class UserProfileAgent:
    def __init__(self):
        self.interest_vectors: Dict[str, Dict] = {}

    async def update_profile(self, user_id: str, behavior_event: Dict) -> Dict:
        if user_id not in self.interest_vectors:
            self.interest_vectors[user_id] = {}
        entity = behavior_event.get("entity", "")
        action = behavior_event.get("action", "read")
        weights = {"read": 1.0, "click": 0.5, "search": 2.0, "bookmark": 3.0}
        w = weights.get(action, 1.0)
        self.interest_vectors[user_id][entity] = (
            self.interest_vectors[user_id].get(entity, 0) + w
        )
        return {"updated": True, "interests": self.interest_vectors[user_id]}

    async def get_interest_vector(self, user_id: str) -> Dict:
        return self.interest_vectors.get(user_id, {})
