"""
This file defines the FastAPI app for the API and all of its routes.
To run this API, use the FastAPI CLI
$ fastapi dev src/api.py

In this project, the backend is focused on AI-related functionality and trusts
Supabase for authentication and data storage. The frontend should authenticate
with Supabase directly and send the Supabase access token to any protected
endpoints on this API.
"""

from pathlib import Path
import logging
import os
import random
import uuid

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from fastapi import Depends, FastAPI, HTTPException, UploadFile, File

from auth import CurrentUser, get_current_user
from quest_generation import QuestRequest, generate_quests
from quest_verification import verify_quest_image

app = FastAPI()

logger = logging.getLogger(__name__)
log_level = os.getenv("LOG_LEVEL", "INFO").upper()
root_logger = logging.getLogger()
if not root_logger.handlers:
    logging.basicConfig(level=getattr(logging, log_level, logging.INFO))


@app.get("/hello")
async def hello() -> dict[str, str]:
    """Get hello message."""
    return {"message": "Hello from FastAPI"}


@app.get("/random")
async def get_random_item(maximum: int) -> dict[str, int]:
    """Get an item with a random ID."""
    return {"itemId": random.randint(0, maximum)}


@app.post("/quests/generate")
async def generate_quest(body: QuestRequest):
    """Generate quests using Gemini. See quest_generation module."""
    try:
        return await generate_quests(body)
    except ValueError as e:
        msg = str(e)
        if "Missing" in msg and "environment variable" in msg:
            raise HTTPException(status_code=500, detail=msg) from e
        raise HTTPException(
            status_code=502,
            detail={"error": "Failed to parse model response"},
        ) from e
    except Exception as exc:
        error_id = uuid.uuid4().hex
        logger.exception("Model call failed (%s)", error_id)
        raise HTTPException(
            status_code=502,
            detail={"error": "Model call failed", "error_id": error_id},
        ) from exc


@app.post("/verify-quest")
async def verify_quest(
    quest_description: str,
    image: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user),
) -> dict[str, object]:
    """
    Verify quest completion with an image. Protected; requires Bearer token.
    See quest_verification module.
    """
    image_bytes = await image.read()
    result = verify_quest_image(quest_description, image_bytes)
    return {
        "userId": current_user.id,
        "questDescription": quest_description,
        "verified": result["verified"],
        "reason": result["reason"],
    }
