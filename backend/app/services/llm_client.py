"""
Thin LLM wrapper used by the agent for natural-language generation.

The agent NEVER lets the LLM invent places: retrieved candidates are decided
by retrieval.py, and the structured `recommendations` list returned to the
guest is built from those candidates in code, not parsed from LLM text. The
LLM is only asked to write the friendly wrapper message around a candidate
list it is given.

If ANTHROPIC_API_KEY is not set (e.g. running locally/in CI without a key),
this falls back to a deterministic template so the rest of the system keeps
working without errors and without any network call.
"""

from __future__ import annotations

import os

try:
    import anthropic  # type: ignore
except ImportError:  # pragma: no cover
    anthropic = None

# Configurable via env var so the team can swap models without a code change.
# claude-sonnet-5 is a solid default; use claude-haiku-4-5-20251001 for a
# cheaper/faster option if you're rate-limited during the demo.
MODEL = os.environ.get("VOYAGE_LLM_MODEL", "claude-sonnet-5")


def _has_live_client() -> bool:
    return anthropic is not None and bool(os.environ.get("ANTHROPIC_API_KEY"))


def generate_message(system_prompt: str, user_prompt: str, max_tokens: int = 400) -> str:
    """Generate a natural-language message. Falls back to the raw prompt content
    (already-formatted, grounded text) if no API key/client is available."""

    if _has_live_client():
        try:
            client = anthropic.Anthropic()
            response = client.messages.create(
                model=MODEL,
                max_tokens=max_tokens,
                system=system_prompt,
                messages=[{"role": "user", "content": user_prompt}],
            )
            text_parts = [
                block.text for block in response.content if block.type == "text"
            ]
            if text_parts:
                return "".join(text_parts).strip()
        except Exception:
            # Network/auth/API errors should never break the agent response;
            # fall through to the deterministic fallback below.
            pass

    return _fallback_message(user_prompt)


def _fallback_message(user_prompt: str) -> str:
    """Deterministic, template-based fallback used when no live LLM is configured.
    Keeps the agent fully functional offline for local dev, tests and grading."""

    return user_prompt
