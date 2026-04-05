"""Legacy handoff module — reserved for future session orchestration helpers."""

from __future__ import annotations


class HandoffManager:
    """Placeholder for rocket→agent session handoff coordination (reserved)."""

    pass


# Re-export prompt builder used by api and BrowserUseAgent
from src.browser.agent_handoff import build_agent_handoff_prompt  # noqa: E402

__all__ = ["HandoffManager", "build_agent_handoff_prompt"]
