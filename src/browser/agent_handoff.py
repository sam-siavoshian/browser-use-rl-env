"""Prompts for handing off from Playwright rocket to browser-use agent."""

from __future__ import annotations

from typing import Literal

from src.models import RocketResult

HandoffBranch = Literal["none", "full", "partial"]


def build_agent_handoff_prompt(
    task: str,
    rocket_result: RocketResult | None,
    step_summary: str | None = None,
) -> tuple[str, bool, HandoffBranch]:
    """Build the agent task string after rocket, and whether URL auto-open should be skipped.

    Returns:
        (prompt, skip_initial_url_open, branch)
        ``skip_initial_url_open`` is True when rocket already ran at least one step
        (same semantics as ``directly_open_url=False`` in browser-use).
    """
    if rocket_result is None or rocket_result.steps_completed <= 0:
        return task, False, "none"

    n = rocket_result.steps_completed
    total = rocket_result.total_steps
    url = (rocket_result.current_url or "").strip()
    url_part = f" Current page: {url}" if url else ""

    # Include step-by-step summary if available
    summary_part = ""
    if step_summary:
        summary_part = f"\n\nAutomation status:\n{step_summary}"

    # Include info about skipped steps
    skipped = rocket_result.skipped_steps
    skip_part = ""
    if skipped:
        skip_part = f" ({len(skipped)} step(s) were skipped as not needed for this task.)"

    done_all = (
        not rocket_result.aborted
        and total > 0
        and n >= total
    )

    if done_all:
        prompt = (
            f"Goal: {task}\n\n"
            f"Playwright already finished all {n} scripted steps.{skip_part}{url_part}"
            f"{summary_part}\n"
            f"Do not navigate, search, or sort again unless the page is clearly wrong. "
            f"Read the visible page and answer the goal in a short reply."
        )
        return prompt, True, "full"

    abort = ""
    if rocket_result.aborted and rocket_result.abort_reason:
        abort = f" Stopped early: {rocket_result.abort_reason}"

    prompt = (
        f"Goal: {task}\n\n"
        f"Only {n} of {total} Playwright steps ran.{abort}{skip_part}{url_part}"
        f"{summary_part}\n"
        f"Complete what is left from this state."
    )
    return prompt, True, "partial"
