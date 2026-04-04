"""Three-layer matching orchestrator.

Combines domain extraction, action type classification, and pgvector
cosine similarity search to find the best matching template for a task.
"""

import json
import os
from dataclasses import dataclass
from typing import Any

from ..db.embeddings import generate_embedding
from .action_type import classify_action_type
from .domain import extract_domain


@dataclass
class TemplateMatch:
    """Result of a successful template match."""

    template_id: str
    task_pattern: str
    steps: list[dict[str, Any]]
    handoff_index: int
    parameters: list[dict[str, Any]]
    similarity: float
    confidence: float
    confidence_band: str  # "very_high", "high", "medium"
    domain: str
    action_type: str


async def find_matching_template(
    task_description: str,
) -> TemplateMatch | None:
    """Three-layer matching: domain -> action_type -> semantic similarity.

    Returns the best matching TemplateMatch, or None if no match found.

    Confidence bands:
    - >= 0.90: very_high — execute all rocket steps
    - 0.75-0.89: high — execute all rocket steps
    - 0.50-0.74: medium — only execute fixed steps
    - < 0.50: no match
    """
    # Layer 1: Domain extraction
    domain = extract_domain(task_description)
    if domain is None:
        return None

    # Layer 2: Action type classification
    action_type = classify_action_type(task_description)

    # Layer 3: Embedding similarity search
    embedding = generate_embedding(task_description)

    from supabase import create_client
    client = create_client(
        os.environ.get("SUPABASE_URL", ""),
        os.environ.get("SUPABASE_SERVICE_ROLE_KEY", ""),
    )

    # Fetch templates and compute similarity in Python (works without pgvector RPC)
    import numpy as np

    # Fetch all templates with confidence >= 0.2
    query = client.table("task_templates").select(
        "id, task_pattern, steps, handoff_index, parameters, confidence, action_type, domain, embedding"
    ).gte("confidence", 0.2)
    result = query.execute()

    # Filter by domain match (flexible: handles subdomains like news.ycombinator.com vs ycombinator.com)
    domain_filtered = []
    for t in result.data:
        t_domain = t.get("domain", "")
        if (t_domain == domain
            or t_domain.endswith(f".{domain}")
            or domain.endswith(f".{t_domain}")
            or domain in t_domain
            or t_domain in domain):
            domain_filtered.append(t)
    result_data = domain_filtered if domain_filtered else result.data

    rows = []
    query_vec = np.array(embedding)
    query_norm = np.linalg.norm(query_vec)
    for t in result_data:
        t_emb = t.get("embedding")
        if not t_emb:
            continue
        if isinstance(t_emb, str):
            t_emb = json.loads(t_emb)
        t_vec = np.array(t_emb)
        t_norm = np.linalg.norm(t_vec)
        if query_norm == 0 or t_norm == 0:
            continue
        sim = float(np.dot(query_vec, t_vec) / (query_norm * t_norm))
        t["similarity"] = sim
        rows.append(t)
    rows.sort(key=lambda x: x.get("similarity", 0), reverse=True)

    if not rows:
        return None

    row = rows[0]
    similarity = float(row.get("similarity", 0))

    # Apply similarity threshold — 0.75 minimum for any match
    if similarity < 0.75:
        return None

    # Determine confidence band
    if similarity >= 0.90:
        band = "very_high"
    elif similarity >= 0.75:
        band = "high"
    else:
        band = "medium"

    steps = row.get("steps", [])
    if isinstance(steps, str):
        steps = json.loads(steps)
    parameters = row.get("parameters", [])
    if isinstance(parameters, str):
        parameters = json.loads(parameters)

    return TemplateMatch(
        template_id=str(row["id"]),
        task_pattern=row["task_pattern"],
        steps=steps,
        handoff_index=row.get("handoff_index", 0),
        parameters=parameters,
        similarity=similarity,
        confidence=float(row.get("confidence", 0.5)),
        confidence_band=band,
        domain=row.get("domain", domain),
        action_type=row.get("action_type", action_type or "unknown"),
    )
