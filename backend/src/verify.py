
import io
from PIL import Image
from pydantic import BaseModel
from google import genai
from google.genai import types
from dotenv import load_dotenv
import os
from pathlib import Path

# load_dotenv("key.env") # This loads the .env file
BASE_DIR = Path(__file__).resolve().parent.parent
env_path = BASE_DIR / "key.env"

load_dotenv(dotenv_path=env_path)

# Do not instantiate the genai client at import time. Create it lazily
# to avoid import-time side effects when `API_KEY` is missing/invalid.
_client = None

def get_genai_client():
    """Lazily create and return a `genai.Client`.

    Raises a RuntimeError if `API_KEY` is not set so callers fail with a
    clear message instead of causing import-time crashes.
    """
    global _client
    if _client is not None:
        return _client

    api_key = os.getenv("API_KEY")
    if not api_key:
        raise RuntimeError(
            "API_KEY is not set. Set the API_KEY environment variable or provide key.env"
        )

    _client = genai.Client(api_key=api_key, http_options={"api_version": "v1beta"})
    return _client

class VerificationResult(BaseModel):
    verified: bool
    reason: str
    confidence_score: int

# client = genai.Client(api_key="API_KEY")

def get_gps_data(image_bytes: bytes):
    """Helper to pull GPS from photo if it exists."""
    img = Image.open(io.BytesIO(image_bytes))
    exif = img._getexif()
    if not exif: return None
    # ... logic to extract lat/long ...
    return "GPS Found" # Simplified for now

def verify_quest_completion(image_bytes: bytes, location_name: str, context: str):
    image_part = types.Part.from_bytes(
        data=image_bytes, 
        mime_type="image/jpeg"
    )
    # 1. OPTIONAL: Check Metadata first
    gps = get_gps_data(image_bytes)
    print(f"DEBUG: Photo Metadata status: {gps}")

    # 2. RUN VISION CHECK (This is your current code)
    # Ensure the provided bytes decode to a valid image. Use PIL's
    # `verify()` which checks file integrity without loading all pixels.
    try:
        with Image.open(io.BytesIO(image_bytes)) as _img:
            _img.verify()
    except Exception as e:
        raise ValueError("Invalid image bytes: cannot decode image") from e

    # We make the prompt even stricter to 'instill' better judging
    prompt = f"Verify if this image shows {location_name}. Context: {context}"

    client = get_genai_client()

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[prompt, image_part],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=VerificationResult, # Forces the AI to follow your rules
        )
    )

    return response.parsed.model_dump()
