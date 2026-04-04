"""Cloud browser management via Browser Use BaaS API."""

from __future__ import annotations

import asyncio
import logging
import os

import httpx

from src.models import CloudBrowserSession

logger = logging.getLogger("rocket_booster.cloud")

BROWSER_USE_API_BASE = "https://api.browser-use.com/api/v3"


def _get_api_key() -> str:
    key = os.environ.get("BROWSER_USE_API_KEY")
    if not key:
        raise RuntimeError("BROWSER_USE_API_KEY environment variable is not set")
    return key


class CloudBrowserManager:
    """Creates and manages BaaS browser sessions."""

    def __init__(self, api_key: str | None = None):
        self._api_key = api_key or _get_api_key()

    def _headers(self) -> dict[str, str]:
        return {
            "X-Browser-Use-API-Key": self._api_key,
            "Content-Type": "application/json",
        }

    async def create(
        self,
        timeout_minutes: int = 60,
    ) -> CloudBrowserSession:
        """Create a BaaS browser and return session metadata including cdpUrl.

        Raises httpx.HTTPStatusError on API failure.
        Raises ValueError if the response is missing cdpUrl.
        """
        body: dict = {}
        if timeout_minutes != 60:
            body["timeout"] = timeout_minutes

        max_retries = 3
        async with httpx.AsyncClient() as client:
            for attempt in range(max_retries):
                response = await client.post(
                    f"{BROWSER_USE_API_BASE}/browsers",
                    headers=self._headers(),
                    json=body,
                    timeout=30.0,
                )
                if response.status_code == 429 and attempt < max_retries - 1:
                    wait = 2 ** attempt + 1  # 2s, 3s, 5s
                    logger.warning("Rate limited (429), retrying in %ds (attempt %d/%d)", wait, attempt + 1, max_retries)
                    await asyncio.sleep(wait)
                    continue
                response.raise_for_status()
                break
            data = response.json()

            if "cdpUrl" not in data:
                raise ValueError(f"BaaS response missing cdpUrl: {data}")

            session = CloudBrowserSession(
                browser_id=data["id"],
                cdp_url=data["cdpUrl"],
                live_url=data.get("liveUrl", ""),
                status=data.get("status", "running"),
            )
            logger.info("Browser created: %s", session.browser_id)
            logger.info("Live view: %s", session.live_url)
            return session

    async def stop(self, browser_id: str) -> None:
        """Stop a BaaS browser session. Idempotent — safe to call on already-stopped sessions."""
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{BROWSER_USE_API_BASE}/browsers/{browser_id}",
                headers=self._headers(),
                json={"action": "stop"},
                timeout=15.0,
            )
            # 404 = already stopped, which is fine
            if response.status_code not in (200, 204, 404):
                response.raise_for_status()
            logger.info("Browser %s stopped", browser_id)

    async def get_status(self, browser_id: str) -> str:
        """Check the status of a BaaS browser session."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BROWSER_USE_API_BASE}/browsers/{browser_id}",
                headers={"X-Browser-Use-API-Key": self._api_key},
                timeout=10.0,
            )
            response.raise_for_status()
            return response.json().get("status", "unknown")
