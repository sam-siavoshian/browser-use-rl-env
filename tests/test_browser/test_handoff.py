"""Tests for rocket → agent handoff prompts."""

from src.browser.agent_handoff import build_agent_handoff_prompt
from src.models import RocketResult


def test_no_rocket_returns_plain_task():
    text, skip, branch = build_agent_handoff_prompt("buy milk", None)
    assert text == "buy milk"
    assert skip is False
    assert branch == "none"


def test_full_completion_no_continue_framing():
    rr = RocketResult(
        steps_completed=5,
        total_steps=5,
        duration_seconds=1.0,
        aborted=False,
        current_url="https://amazon.com/s?k=headphones",
    )
    text, skip, branch = build_agent_handoff_prompt(
        "find cheapest headphones", rr
    )
    assert branch == "full"
    assert skip is True
    assert "Continue" not in text
    assert "remaining work" not in text.lower()
    assert "Playwright already finished all 5" in text
    assert "Do not navigate" in text


def test_partial_rocket_says_complete_what_is_left():
    rr = RocketResult(
        steps_completed=2,
        total_steps=5,
        duration_seconds=1.0,
        aborted=True,
        abort_reason="Timeout",
        current_url="https://example.com",
    )
    text, skip, branch = build_agent_handoff_prompt("task", rr)
    assert branch == "partial"
    assert skip is True
    assert "2 of 5" in text
    assert "Stopped early" in text
