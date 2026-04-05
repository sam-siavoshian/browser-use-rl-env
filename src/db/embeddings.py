"""OpenAI embedding generation for task templates.

Uses text-embedding-3-large (3072 dimensions) with rich composite text
that captures task semantics, step structure, parameters, and domain context.
"""

import os
from functools import lru_cache
from typing import Any

from openai import OpenAI

EMBEDDING_MODEL = "text-embedding-3-large"
EMBEDDING_DIMS = 3072

_openai_client: OpenAI | None = None


def _get_openai() -> OpenAI:
    """Get or create the singleton OpenAI client."""
    global _openai_client
    if _openai_client is None:
        api_key = os.environ.get("OPENAI_API_KEY", "")
        if not api_key:
            raise RuntimeError(
                "OPENAI_API_KEY must be set for embedding generation"
            )
        _openai_client = OpenAI(api_key=api_key)
    return _openai_client


def build_embedding_text(
    task_pattern: str,
    steps: list[dict[str, Any]],
    parameters: list[dict[str, Any]],
    domain: str,
    action_type: str,
    site_knowledge: dict[str, Any] | None = None,
) -> str:
    """Build a structured text representation for embedding.

    Combines task semantics, step structure, parameter schema, and domain
    context into a single string optimized for embedding quality.

    The task: line comes first as the primary semantic signal.
    """
    lines = [f"task: {task_pattern}"]

    # Step sequence — action verbs only, DYNAMIC steps labeled as "dynamic"
    if steps:
        step_names = []
        for s in steps:
            classification = s.get("classification", "").upper()
            if classification == "DYNAMIC":
                step_names.append("dynamic")
            else:
                action = s.get("action", "unknown")
                step_names.append(action)
        lines.append(f"steps: {' > '.join(step_names)}")

    # Parameter schema
    if parameters:
        param_parts = []
        for p in parameters:
            name = p.get("name", "unknown")
            ptype = p.get("type", "string")
            required = "required" if p.get("required", True) else "optional"
            param_parts.append(f"{name}({ptype}, {required})")
        lines.append(f"params: {', '.join(param_parts)}")

    lines.append(f"domain: {domain}")
    lines.append(f"action: {action_type}")

    # Site knowledge context — semantic element names from selector_map keys
    if site_knowledge:
        selector_map = site_knowledge.get("selector_map", {})
        if selector_map:
            context_keys = list(selector_map.keys())
            lines.append(f"context: {', '.join(context_keys)}")

    return "\n".join(lines)


def build_query_embedding_text(
    task_description: str,
    domain: str | None = None,
    action_type: str | None = None,
) -> str:
    """Build a partial rich text for query embeddings.

    Queries don't have steps/params, so we include only the metadata
    we can infer (domain, action_type) to improve matching accuracy.
    """
    lines = [f"task: {task_description}"]
    if domain:
        lines.append(f"domain: {domain}")
    if action_type:
        lines.append(f"action: {action_type}")
    return "\n".join(lines)


def generate_embedding(text: str) -> list[float]:
    """Generate a 3072-dimensional embedding for the given text.

    Args:
        text: The text to embed (rich composite text or raw task description).

    Returns:
        List of 3072 floats representing the embedding vector.
    """
    client = _get_openai()
    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=text,
        encoding_format="float",
    )
    return response.data[0].embedding


def generate_embeddings_batch(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for multiple texts in a single API call.

    OpenAI supports up to 2048 inputs per batch.
    """
    client = _get_openai()
    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=texts,
        encoding_format="float",
    )
    sorted_data = sorted(response.data, key=lambda x: x.index)
    return [item.embedding for item in sorted_data]


@lru_cache(maxsize=256)
def generate_embedding_cached(text: str) -> tuple[float, ...]:
    """Cached version of generate_embedding.

    Returns a tuple (hashable) instead of list for LRU cache compatibility.
    """
    return tuple(generate_embedding(text))
