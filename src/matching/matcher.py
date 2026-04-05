"""Three-layer matching orchestrator.

Combines domain extraction, action type classification, and pgvector
cosine similarity search to find the best matching template for a task.

Uses SQL-native pre-filtering and pgvector's <=> operator for fast,
accurate similarity search. Medium-confidence matches are verified by LLM.
"""

import json
import logging
from dataclasses import dataclass
from typing import Any

from ..db.client import get_pg_pool
from ..db.embeddings import build_query_embedding_text, generate_embedding
from .action_type import classify_action_type
from .domain import extract_domain
from .verifier import verify_template_match

logger = logging.getLogger(__name__)


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
    needs_verification: bool  # True for medium band (0.50-0.74)


# SQL query: pre-filter by domain + action_type, rank by cosine similarity
_SIMILARITY_SQL = """
SELECT id, task_pattern, steps, handoff_index, parameters, confidence,
       action_type, domain,
       1 - (embedding <=> $1::vector) AS similarity
FROM task_templates
WHERE confidence >= 0.2
  AND (domain = $2 OR domain LIKE '%.' || $2 OR $2 LIKE '%.' || domain
       OR $2 LIKE '%.' || domain OR position($2 in domain) > 0
       OR position(domain in $2) > 0)
  AND ($3::text IS NULL OR action_type = $3)
ORDER BY embedding <=> $1::vector ASC
LIMIT 5
"""


async def find_matching_template(
    task_description: str,
) -> TemplateMatch | None:
    """Three-layer matching: domain -> action_type -> semantic similarity.

    Returns the best matching TemplateMatch, or None if no match found.

    Layer 1: Extract domain from task description
    Layer 2: Classify action type
    Layer 3: SQL-native pgvector similarity search with pre-filtering

    Confidence bands:
    - >= 0.90: very_high — execute all rocket steps
    - 0.75-0.89: high — execute all rocket steps
    - 0.50-0.74: medium — LLM-verified, only execute fixed steps
    - < 0.50: no match
    """
    # Layer 1: Domain extraction
    domain = extract_domain(task_description)
    if domain is None:
        return None

    # Layer 2: Action type classification
    action_type = classify_action_type(task_description)

    # Layer 3: Embedding similarity search via pgvector
    query_text = build_query_embedding_text(
        task_description=task_description,
        domain=domain,
        action_type=action_type,
    )
    embedding = generate_embedding(query_text)

    # Format embedding for pgvector
    embedding_str = f"[{','.join(str(x) for x in embedding)}]"

    pool = await get_pg_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            _SIMILARITY_SQL,
            embedding_str,
            domain,
            action_type,
        )

    if not rows:
        return None

    row = rows[0]
    similarity = float(row["similarity"])

    # Apply similarity threshold — 0.50 minimum (medium band reaches LLM verifier)
    if similarity < 0.50:
        return None

    # Determine confidence band
    if similarity >= 0.90:
        band = "very_high"
    elif similarity >= 0.75:
        band = "high"
    else:
        band = "medium"

    # LLM verification for medium-confidence matches
    needs_verification = band == "medium"
    if needs_verification:
        logger.info(
            "Medium-confidence match (%.3f), running LLM verification",
            similarity,
        )
        is_valid = await verify_template_match(
            task_description=task_description,
            template_task_pattern=row["task_pattern"],
            domain=row["domain"],
            similarity=similarity,
        )
        if not is_valid:
            logger.info("LLM verification rejected the match")
            return None

    steps = row["steps"]
    if isinstance(steps, str):
        steps = json.loads(steps)
    parameters = row["parameters"]
    if isinstance(parameters, str):
        parameters = json.loads(parameters)

    return TemplateMatch(
        template_id=str(row["id"]),
        task_pattern=row["task_pattern"],
        steps=steps,
        handoff_index=row["handoff_index"] or 0,
        parameters=parameters,
        similarity=similarity,
        confidence=float(row["confidence"]),
        confidence_band=band,
        domain=row["domain"],
        action_type=row["action_type"] or action_type or "unknown",
        needs_verification=needs_verification,
    )
