"""
Hybrid retrieval engine for the local Goa knowledge base.

Pipeline:
    User Query
        -> Metadata Filtering
        -> BM25 (keyword)        ----\
        -> Semantic (TF-IDF/cos) ----+--> RRF fusion --> Top-K
        -> Confidence threshold / fallback

Design notes:
- BM25 handles exact keyword matches (place names, cuisines, categories).
- The "semantic" retriever uses TF-IDF + cosine similarity. It is deliberately
  swappable: DEFAULT_EMBEDDER below is the seam where a real embedding model
  (sentence-transformers, an API embedding model, etc.) can be dropped in
  without changing anything else in this module or in agent.py.
- Results are combined with Reciprocal Rank Fusion (RRF) rather than raw
  score blending, since BM25 and cosine-similarity scores are not on the
  same scale and RRF avoids having to tune a weighting between them.
- Nothing here calls an LLM. This module only returns grounded candidate
  documents; the agent decides what to do with them.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

from rank_bm25 import BM25Okapi
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "goa"

# Below this fused score, we treat the result set as low-confidence.
DEFAULT_CONFIDENCE_THRESHOLD = 0.015

# RRF constant (standard default; higher = flatter weighting across ranks).
RRF_K = 60

_TOKEN_RE = re.compile(r"[a-z0-9]+")


def _tokenize(text: str) -> list[str]:
    return _TOKEN_RE.findall(text.lower())


@dataclass
class Document:
    id: str
    name: str
    category: str
    area: str
    tags: list[str] = field(default_factory=list)
    price: Optional[str] = None
    description: str = ""
    hours: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    source: str = "curated"

    @property
    def search_text(self) -> str:
        return " ".join(
            [
                self.name,
                self.category,
                self.area,
                " ".join(self.tags),
                self.description,
            ]
        )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "area": self.area,
            "tags": self.tags,
            "price": self.price,
            "description": self.description,
            "hours": self.hours,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "source": self.source,
        }


def load_dataset(data_dir: Path = DATA_DIR) -> list[Document]:
    """Load and normalize every JSON file in the Goa dataset directory."""

    documents: list[Document] = []

    for path in sorted(data_dir.glob("*.json")):
        with open(path, "r", encoding="utf-8") as f:
            items = json.load(f)

        for item in items:
            documents.append(
                Document(
                    id=item["id"],
                    name=item["name"],
                    category=item.get("category", "unknown"),
                    area=item.get("area", "unknown"),
                    tags=item.get("tags", []),
                    price=item.get("price"),
                    description=item.get("description", ""),
                    hours=item.get("hours"),
                    latitude=item.get("latitude"),
                    longitude=item.get("longitude"),
                    source=item.get("source", "curated"),
                )
            )

    if not documents:
        raise RuntimeError(f"No dataset files found in {data_dir}")

    return documents


@dataclass
class RetrievalResult:
    document: Document
    score: float


@dataclass
class RetrievalResponse:
    results: list[RetrievalResult]
    is_low_confidence: bool
    query: str
    filters_applied: dict


class HybridRetriever:
    """BM25 + TF-IDF semantic retrieval fused with RRF, with metadata filtering."""

    def __init__(self, documents: Optional[list[Document]] = None):
        self.documents = documents if documents is not None else load_dataset()

        tokenized_corpus = [_tokenize(doc.search_text) for doc in self.documents]
        self._bm25 = BM25Okapi(tokenized_corpus)

        # TF-IDF stands in for an embedding model here (see module docstring).
        self._vectorizer = TfidfVectorizer(stop_words="english")
        self._tfidf_matrix = self._vectorizer.fit_transform(
            [doc.search_text for doc in self.documents]
        )

    def _apply_filters(
        self, indices: list[int], filters: Optional[dict]
    ) -> list[int]:
        if not filters:
            return indices

        area = filters.get("area")
        category = filters.get("category")
        exclude_categories = filters.get("exclude_categories") or set()
        tag = filters.get("tag")
        exclude_ids = filters.get("exclude_ids") or set()

        filtered = []
        for i in indices:
            doc = self.documents[i]
            if doc.id in exclude_ids:
                continue
            if area and area.lower() not in doc.area.lower():
                continue
            if category and doc.category != category:
                continue
            if doc.category in exclude_categories:
                continue
            if tag and tag.lower() not in [t.lower() for t in doc.tags]:
                continue
            filtered.append(i)
        return filtered

    def search(
        self,
        query: str,
        top_k: int = 5,
        filters: Optional[dict] = None,
        confidence_threshold: float = DEFAULT_CONFIDENCE_THRESHOLD,
    ) -> RetrievalResponse:
        all_indices = list(range(len(self.documents)))
        candidate_indices = self._apply_filters(all_indices, filters)
        filters_applied = dict(filters or {})

        # Progressive relaxation: if filters are too strict and eliminate every
        # document, drop constraints in an order that keeps the most important
        # one -- category (what kind of place, e.g. "restaurant" for a lunch
        # slot) -- intact as long as possible. Area is relaxed before category
        # so a itinerary slot never gets back-filled with the wrong place type.
        relax_order = ["tag", "area", "category"]
        relaxed = dict(filters or {})
        for key in relax_order:
            if candidate_indices or key not in relaxed:
                continue
            relaxed = {k: v for k, v in relaxed.items() if k != key}
            candidate_indices = self._apply_filters(all_indices, relaxed)
            filters_applied[f"_relaxed_{key}"] = True

        if not candidate_indices:
            candidate_indices = all_indices
            filters_applied["_fallback_no_filters"] = True

        # --- BM25 ranking over candidates ---
        tokenized_query = _tokenize(query)
        bm25_scores_all = self._bm25.get_scores(tokenized_query)
        bm25_ranked = sorted(
            candidate_indices, key=lambda i: bm25_scores_all[i], reverse=True
        )

        # --- Semantic (TF-IDF cosine) ranking over candidates ---
        query_vec = self._vectorizer.transform([query])
        sim_scores_all = cosine_similarity(query_vec, self._tfidf_matrix)[0]
        semantic_ranked = sorted(
            candidate_indices, key=lambda i: sim_scores_all[i], reverse=True
        )

        # --- Reciprocal Rank Fusion ---
        rrf_scores: dict[int, float] = {i: 0.0 for i in candidate_indices}
        for rank, i in enumerate(bm25_ranked):
            rrf_scores[i] += 1.0 / (RRF_K + rank + 1)
        for rank, i in enumerate(semantic_ranked):
            rrf_scores[i] += 1.0 / (RRF_K + rank + 1)

        fused_ranked = sorted(
            candidate_indices, key=lambda i: rrf_scores[i], reverse=True
        )

        top_indices = fused_ranked[:top_k]
        results = [
            RetrievalResult(document=self.documents[i], score=rrf_scores[i])
            for i in top_indices
        ]

        is_low_confidence = (
            not results or results[0].score < confidence_threshold
        )

        return RetrievalResponse(
            results=results,
            is_low_confidence=is_low_confidence,
            query=query,
            filters_applied=filters_applied,
        )


_retriever_instance: Optional[HybridRetriever] = None


def get_retriever() -> HybridRetriever:
    """Lazily build a single shared retriever instance (avoids re-indexing per request)."""

    global _retriever_instance
    if _retriever_instance is None:
        _retriever_instance = HybridRetriever()
    return _retriever_instance
