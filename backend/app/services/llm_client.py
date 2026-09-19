"""
Thin LLM wrapper used by the agent for natural-language generation.

The agent NEVER lets the LLM invent places: retrieved candidates are decided
by retrieval.py, and the structured recommendations list returned to the
guest is built from those candidates in code, not parsed from LLM text.

The LLM is only asked to write the friendly wrapper message around a
candidate list it is given.

If GEMINI_API_KEY is not set, this falls back to a deterministic template
so the rest of the system keeps working without errors and without a
network call.
"""

from __future__ import annotations
import anthropic
from dotenv import load_dotenv
import os
load_dotenv()


try:
    from google import genai
except ImportError:  # pragma: no cover
    genai = None


# Configurable through environment variables.
MODEL = os.environ.get("VOYAGE_LLM_MODEL", "gemini-2.5-flash")


def _has_live_client() -> bool:
    return genai is not None and bool(os.environ.get("GEMINI_API_KEY"))


def generate_message(
    system_prompt: str,
    user_prompt: str,
    max_tokens: int = 400,
) -> str:
    """
    Generate a natural-language message using Gemini.

    Falls back to the raw prompt content if Gemini is unavailable,
    so the rest of the agent continues working locally/without a key.
    """

    if _has_live_client():
        try:
            client = genai.Client()

            prompt = f"""
SYSTEM INSTRUCTIONS:
{system_prompt}

USER REQUEST:
{user_prompt}
"""

            response = client.models.generate_content(
                model=MODEL,
                contents=prompt,
                config={
                    "max_output_tokens": max_tokens,
                },
            )

            if response.text:
                return response.text.strip()

        except Exception:
            # API/auth/network errors should never break the agent.
            pass

    return _fallback_message(user_prompt)


def _fallback_message(user_prompt: str) -> str:
    """
    Deterministic fallback used when Gemini is unavailable.
    Keeps the agent functional for local development and tests.
    """

    return user_prompt