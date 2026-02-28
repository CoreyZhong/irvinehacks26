# backend/src/test_gemini_jsonouput.py
import os
import json
import re
from google import genai

# Use the exact model identifier returned by ListModels
MODEL = "gemini-2.5-flash"
KEY_ENV = "GEMINI_API_KEY"


def get_client():
    key = os.environ.get(KEY_ENV)
    if not key:
        raise RuntimeError(f"Missing {KEY_ENV} in environment")
    return genai.Client(api_key=key)


def extract_text(resp):
    # SDK response shape may vary; try common paths
    if hasattr(resp, "text"):
        return resp.text
    try:
        return resp.candidates[0].content[0].text
    except Exception:
        return str(resp)


def parse_json_from_text(text):
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # best-effort: find first JSON object/array in text
        m = re.search(r"(\{[\s\S]*\}|\[[\s\S]*\])", text)
        if m:
            return json.loads(m.group(0))
        raise


def main():
    client = get_client()
    prompt = (
        "You are generating fun, safe side quests for UCI students.\n"
        "Rules: respond with ONLY valid JSON (an array of quest objects) and nothing else.\n"
        "Each object must include: title (string), description (string), verificationPrompt (string).\n"
        "Generate 3 short quests."
    )

    # call the model
    resp = client.models.generate_content(
        model=MODEL,
        contents=[{"parts": [{"text": prompt}]}]
    )

    text = extract_text(resp)
    print("Raw model output:\n", text)

    # try to parse JSON and write to file
    try:
        data = parse_json_from_text(text)
    except Exception as exc:
        # save raw output for debugging
        with open("backend/quests_raw.txt", "w") as f:
            f.write(str(text))
        raise RuntimeError("Failed to parse JSON from model output; saved raw to backend/quests_raw.txt") from exc

    out_path = "backend/quests.json"
    with open(out_path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
