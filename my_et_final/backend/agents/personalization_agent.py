"""
Personalization Agent — My ET
Ranks and filters news for each user based on role + behavior.
"""
from typing import Dict, List


ROLE_CATEGORY_WEIGHTS = {
    "investor": {"markets": 1.5, "policy": 1.3, "startups": 1.1, "business": 1.0},
    "founder": {"startups": 1.5, "business": 1.2, "markets": 1.0, "policy": 1.1},
    "student": {"policy": 1.3, "business": 1.2, "markets": 1.0},
    "policy_analyst": {"policy": 1.5, "global": 1.4, "markets": 1.1, "business": 1.0},
    "cinema_enthusiast": {"entertainment": 1.5, "business": 1.0},
    "sportsperson": {"sports": 1.5, "business": 1.0},
    "literature_enthusiast": {"business": 1.0},
    "entrepreneur": {"business": 1.3, "policy": 1.2, "startups": 1.1},
}


class PersonalizationAgent:
    async def rank_for_user(self, user: Dict, articles: List[Dict]) -> List[Dict]:
        role = user.get("role", "investor")
        weights = ROLE_CATEGORY_WEIGHTS.get(role, {})

        scored = []
        for article in articles:
            base_score = article.get("impact_score", 5)
            role_score = article.get("role_relevance", {}).get(role, 5)
            cat_weight = weights.get(article.get("category", "business"), 1.0)
            total = (base_score * 0.4 + role_score * 0.6) * cat_weight
            scored.append((total, article))

        scored.sort(reverse=True)
        return [a for _, a in scored[:15]]
