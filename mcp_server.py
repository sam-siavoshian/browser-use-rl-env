"""Forged MCP Server — Self-improving browser automation for AI assistants.

Two tools:
  run_browser_task  — Execute a browser task. Uses learned templates when available,
                      falls back to full agent and auto-learns for next time.
  list_learned_skills — List what Forged has learned (templates, confidence, speedup).

Runs over stdio transport. Requires the Forged backend (FastAPI) to be running.

Usage:
  python mcp_server.py

Configure in Claude Code settings:
  {
    "mcpServers": {
      "forged": {
        "command": "python",
        "args": ["/path/to/mcp_server.py"],
        "env": {
          "FORGED_API_URL": "http://localhost:8000"
        }
      }
    }
  }
"""

from __future__ import annotations

import asyncio
import os
import time

import httpx
from mcp.server.fastmcp import FastMCP

FORGED_API_URL = os.environ.get("FORGED_API_URL", "http://localhost:8000")
POLL_INTERVAL_S = 0.5
TASK_TIMEOUT_S = 120

mcp = FastMCP(
    "Forged",
    instructions=(
        "Forged is a self-improving browser automation system. "
        "It learns from every task execution, so repeated tasks get faster over time. "
        "Use run_browser_task to execute browser tasks (QA, data extraction, navigation). "
        "Use list_learned_skills to see what Forged already knows."
    ),
)


async def _poll_until_done(
    client: httpx.AsyncClient,
    session_id: str,
) -> dict:
    """Poll /api/status/{session_id} until complete, error, or timeout."""
    deadline = time.monotonic() + TASK_TIMEOUT_S

    while True:
        if time.monotonic() > deadline:
            return {
                "error": f"Task timed out after {TASK_TIMEOUT_S}s",
                "session_id": session_id,
                "timed_out": True,
            }

        resp = await client.get(f"{FORGED_API_URL}/api/status/{session_id}")
        resp.raise_for_status()
        status = resp.json()

        if status.get("status") in ("complete", "error", "not_found"):
            return status

        await asyncio.sleep(POLL_INTERVAL_S)


def _format_run_result(status: dict) -> str:
    """Format a session status dict into a human-readable MCP tool response."""
    lines: list[str] = []

    # Handle timeout
    if status.get("timed_out"):
        lines.append(f"TIMEOUT: Task did not complete within {TASK_TIMEOUT_S}s.")
        lines.append(f"Session ID: {status.get('session_id', 'unknown')}")
        steps = status.get("steps", [])
        if steps:
            lines.append(f"Steps completed before timeout: {len(steps)}")
            for s in steps[-3:]:
                lines.append(f"  - {s.get('description', 'unknown step')}")
        return "\n".join(lines)

    # Handle error
    if status.get("status") == "error":
        lines.append(f"ERROR: {status.get('error', 'Unknown error')}")
        lines.append(f"Session ID: {status.get('session_id', 'unknown')}")
        steps = status.get("steps", [])
        if steps:
            lines.append(f"Steps completed before error: {len(steps)}")
            for s in steps[-3:]:
                lines.append(f"  - {s.get('description', 'unknown step')}")
        return "\n".join(lines)

    # Handle not_found
    if status.get("status") == "not_found":
        return f"ERROR: Session {status.get('session_id', 'unknown')} not found."

    # Success
    result_text = status.get("result", "Task completed (no text result)")
    lines.append(f"Result: {result_text}")

    # Mode and template match info
    mode = status.get("mode_used", "unknown")
    template_match = status.get("template_match")
    if mode == "rocket" and template_match:
        similarity = template_match.get("similarity", 0)
        pattern = template_match.get("task_pattern", "")
        lines.append(
            f"Mode: rocket (learned template matched, "
            f"{similarity:.0%} confidence, pattern: \"{pattern}\")"
        )
    elif mode == "baseline_learn":
        lines.append("Mode: baseline (no template found — learning for next time)")
    else:
        lines.append(f"Mode: {mode}")

    # Duration
    duration_ms = status.get("duration_ms", 0)
    if duration_ms:
        lines.append(f"Duration: {duration_ms / 1000:.1f}s")

    # Step breakdown
    steps = status.get("steps", [])
    if steps:
        rocket_steps = sum(1 for s in steps if s.get("type") == "playwright")
        agent_steps = sum(1 for s in steps if s.get("type") == "agent")
        lines.append(f"Steps: {rocket_steps} rocket (Playwright) + {agent_steps} agent (Claude)")

    # Live URL
    live_url = status.get("live_url")
    if live_url:
        lines.append(f"Live browser: {live_url}")

    # Learning info — check if a template was learned (last steps often show this)
    for s in reversed(steps):
        desc = s.get("description", "")
        if "template" in desc.lower() and "learned" in desc.lower():
            lines.append(f"Template learned: {desc}")
            lines.append("Next run will be faster.")
            break
        if "skill saved" in desc.lower() or "template saved" in desc.lower():
            lines.append(f"Template learned: {desc}")
            lines.append("Next run will be faster.")
            break

    return "\n".join(lines)


def _format_templates(templates: list[dict], domain_filter: str | None) -> str:
    """Format template list into a human-readable response."""
    if domain_filter:
        templates = [
            t for t in templates
            if t.get("domain", "").lower() == domain_filter.lower()
        ]

    if not templates:
        if domain_filter:
            return f"No learned skills found for domain: {domain_filter}"
        return "No learned skills yet. Run some browser tasks to start learning."

    lines: list[str] = [f"Learned Skills ({len(templates)} total):", ""]

    for i, t in enumerate(templates, 1):
        domain = t.get("domain", "unknown")
        pattern = t.get("task_pattern", "unknown")
        confidence = t.get("confidence", 0)
        success_count = t.get("success_count", 0)
        failure_count = t.get("failure_count", 0)

        # Compute step counts from stored steps
        steps = t.get("steps", [])
        handoff_index = t.get("handoff_index", len(steps))
        rocket_count = min(handoff_index, len(steps))
        agent_count = max(0, len(steps) - handoff_index)

        # Compute speedup
        avg_total = t.get("avg_total_duration_ms") or 0
        avg_baseline = t.get("avg_baseline_duration_ms") or 0
        if avg_total > 0 and avg_baseline > 0:
            speedup = f"{avg_baseline / avg_total:.1f}x"
        else:
            speedup = "N/A"

        lines.append(f"{i}. {domain} — \"{pattern}\"")
        lines.append(
            f"   Confidence: {confidence:.0%} | "
            f"Steps: {rocket_count} rocket + {agent_count} agent | "
            f"Avg speedup: {speedup}"
        )
        lines.append(
            f"   Used {success_count + failure_count} times "
            f"({success_count} success, {failure_count} failure)"
        )
        lines.append("")

    return "\n".join(lines)


@mcp.tool()
async def run_browser_task(task: str) -> str:
    """Execute a browser automation task. Forged automatically uses learned
    templates for speed when available. If no template exists, it runs a full
    AI agent and learns from the execution so the next run is faster.

    Args:
        task: Natural language description of the browser task.
              Examples:
                "Log into staging at https://myapp.com"
                "Search for 'headphones' on Amazon"
                "Go to GitHub trending and get the #1 repo"
                "Go to news.ycombinator.com and get the top story title"
    """
    async with httpx.AsyncClient(timeout=httpx.Timeout(TASK_TIMEOUT_S + 10)) as client:
        # Start the task
        try:
            resp = await client.post(
                f"{FORGED_API_URL}/api/chat",
                json={"task": task},
            )
            resp.raise_for_status()
            data = resp.json()
            session_id = data.get("session_id")
            if not session_id:
                return "ERROR: Backend returned no session_id."
        except httpx.ConnectError:
            return (
                f"ERROR: Cannot connect to Forged backend at {FORGED_API_URL}. "
                "Make sure the backend is running (./dev.sh or uvicorn src.api:app)."
            )
        except httpx.HTTPStatusError as e:
            return f"ERROR: Backend returned {e.response.status_code}: {e.response.text}"

        # Poll until done
        status = await _poll_until_done(client, session_id)
        return _format_run_result(status)


@mcp.tool()
async def list_learned_skills(domain: str | None = None) -> str:
    """List browser automation skills that Forged has learned. These are tasks
    that will execute faster because deterministic steps have been cached.

    Args:
        domain: Optional domain filter (e.g., "amazon.com", "github.com").
                If omitted, returns all learned skills.
    """
    async with httpx.AsyncClient(timeout=httpx.Timeout(30)) as client:
        try:
            resp = await client.get(f"{FORGED_API_URL}/api/templates")
            resp.raise_for_status()
            templates = resp.json()
        except httpx.ConnectError:
            return (
                f"ERROR: Cannot connect to Forged backend at {FORGED_API_URL}. "
                "Make sure the backend is running."
            )
        except httpx.HTTPStatusError as e:
            return f"ERROR: Backend returned {e.response.status_code}: {e.response.text}"

    return _format_templates(templates, domain)


if __name__ == "__main__":
    mcp.run(transport="stdio")
