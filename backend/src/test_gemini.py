from google import genai
import os

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

prompt = """
You are generating fun, safe side quests for UCI students.
Rules: ...
Generate 3 quests given these constraints: 
- The quest must be fun and engaging for UCI students.
- The quest must be safe and not encourage any dangerous behavior.
- The quest must be feasible to complete within a reasonable time frame (e.g. a hour)
- The quest must be appropriate for a college campus setting.
- The quest must not involve any illegal activities.
- The quest must not involve any activities that could cause harm to oneself or others.
- The quest must not involve any activities that could damage property.
- The quest must not involve any activities that could be considered harassment or bullying.
_ The quest includes taking a picture to prove that it has been completed at the end, so something that can be verified with a photo.
"""

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=prompt,
)

text = response.text
print(text)