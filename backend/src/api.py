import os
import random
from fastapi import FastAPI, HTTPException, File, UploadFile, Depends
from google import genai
# Using a relative import to prevent the "ModuleNotFound" error
try:
    from .verify import verify_quest_completion
except ImportError:
    from verify import verify_quest_completion

app = FastAPI()

# 1. The "Lazy" Client Builder
def get_ai_client():
    api_key = os.getenv("API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="API_KEY is missing from .env")
    return genai.Client(api_key=api_key, http_options={'api_version': 'v1beta'})

LOCATION_DATA = {
    "dbh": {"name": "Donald Bren Hall", "ctx": "6th floor balcony, glass railings, park view."},
    "fountain": {"name": "Infinity Fountain", "ctx": "Circular water feature, brick plaza."},
    "statue": {"name": "Anteater Statue", "ctx": "Bronze statue near Bren Events Center."}
}

@app.get("/hello")
async def hello():
    return {"message": "Hello from FastAPI"}

@app.post("/verify/{location_id}")
async def verify_image(
    location_id: str, 
    file: UploadFile = File(...),
    client: genai.Client = Depends(get_ai_client) # Inject the client here
):
    # 1. Validate file type
    allowed_types = {"image/jpeg", "image/png", "image/heic", "image/heif"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    # 2. Read image data (ONLY ONCE)
    image_bytes = await file.read()
    
    # 3. Get quest details
    data = LOCATION_DATA.get(location_id.lower())
    if not data:
        raise HTTPException(status_code=404, detail="Location not found")
    
    # 4. Call verification (passing the client!)
    result = verify_quest_completion(
        image_bytes=image_bytes,
        location_name=data["name"],
        context=data["ctx"]
    )
    
    return result