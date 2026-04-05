"""Clean up browser-use BrowserSession without futile CDP WebSocket reconnects.

When the cloud browser stops (or the CDP socket drops), browser-use may try to
auto-reconnect to the same cdp_url. That fails with 503/404 because the remote
browser is gone. Calling ``stop()`` first sets an intentional-stop flag, cancels
in-flight reconnect tasks, and closes the local CDP client — *before* the BaaS
API stops the browser.

``BrowserSession`` has no ``close()`` method; our API previously called it inside
try/except and swallowed AttributeError, so cleanup never ran.
"""

from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger("rocket_booster.session_cleanup")


async def release_browser_session(session: Any) -> None:
    """Disconnect CDP and suppress auto-reconnect. Safe to call more than once."""
    if session is None:
        return

    stop = getattr(session, "stop", None)
    if callable(stop):
        try:
            await stop()
            return
        except Exception as e:
            logger.warning("BrowserSession.stop() failed (non-fatal): %s", e)

    reset = getattr(session, "reset", None)
    if callable(reset):
        try:
            await reset()
        except Exception as e:
            logger.warning("BrowserSession.reset() failed (non-fatal): %s", e)
