"""Story Clustering Agent — My ET"""
import hashlib
from typing import Dict, List


class StoryClusteringAgent:
    async def cluster(self, articles: List[Dict]) -> List[Dict]:
        by_category: Dict[str, List] = {}
        for a in articles:
            cat = a.get("category", "general")
            by_category.setdefault(cat, []).append(a)
        return [
            {
                "id": hashlib.md5(cat.encode()).hexdigest()[:8],
                "title": cat.replace("_", " ").title() + " Stories",
                "article_ids": [a.get("id") for a in arts],
                "tags": [cat],
                "size": len(arts),
            }
            for cat, arts in by_category.items()
        ]
