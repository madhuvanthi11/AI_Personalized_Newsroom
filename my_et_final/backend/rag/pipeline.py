"""
RAG Pipeline — My ET
Lightweight in-memory keyword-based retrieval.
(FAISS/SentenceTransformers optional — install if available)
"""
import os
import pickle
import json
from typing import List, Dict

DOCS_PATH = "data/documents.pkl"


class RAGPipeline:
    def __init__(self):
        self.documents: List[Dict] = []
        os.makedirs("data", exist_ok=True)

    async def initialize(self):
        try:
            if os.path.exists(DOCS_PATH):
                with open(DOCS_PATH, "rb") as f:
                    self.documents = pickle.load(f)
        except Exception:
            self.documents = []
        print(f"[RAG] Initialized with {len(self.documents)} documents")

    async def index_articles(self, articles: List[Dict]):
        self.documents.extend(articles)
        self.documents = self.documents[-2000:]  # Cap at 2000
        try:
            with open(DOCS_PATH, "wb") as f:
                pickle.dump(self.documents, f)
        except Exception:
            pass

    async def retrieve(self, query: str, top_k: int = 5) -> List[Dict]:
        if not self.documents:
            return []
        q = set(query.lower().split())
        scored = []
        for doc in self.documents:
            text = f"{doc.get('title','')} {doc.get('summary','')} {' '.join(doc.get('tags',[]))}".lower()
            score = sum(1 for w in q if w in text)
            if score > 0:
                scored.append((score, doc))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [d for _, d in scored[:top_k]]
