"""
Quest completion verification using Gemini (image + text). Uses QUEST_VERIFICATION_GEMINI_API_KEY.
Stub implementation until vision API is wired up.
"""

import logging
import os
from typing import Any

logger = logging.getLogger(__name__)

KEY_ENV = "QUEST_VERIFICATION_GEMINI_API_KEY"


def verify_quest_image(quest_description: str, image_bytes: bytes) -> dict[str, Any]:
    """
    Verify that an image shows completion of the given quest.
    Returns {"verified": bool, "reason": str}.
    Uses QUEST_VERIFICATION_GEMINI_API_KEY when implemented.
    """
    # TODO: Call Gemini (or other) vision API with quest_description and image_bytes,
    # then return {"verified": True/False, "reason": "..."}.
    _ = quest_description
    _ = image_bytes
    return {
        "verified": False,
        "reason": "AI verification not yet implemented",
    }
