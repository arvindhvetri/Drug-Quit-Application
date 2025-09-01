# utils/tasks.py
import google.generativeai as genai
import random
from dotenv import load_dotenv
import os

load_dotenv()

# Configure Google AI
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
else:
    print("⚠️ GOOGLE_API_KEY not set, using fallback tasks only.")

USE_GEMINI = bool(GOOGLE_API_KEY)

# Fallback tasks with difficulty
FALLBACK_TASKS = {
    "stress": [
        {"title": "Take a photo of your tea after drinking a sip", "difficulty": "easy"},
        {"title": "Snap a picture of your feet on grass or floor", "difficulty": "easy"},
        {"title": "Take a selfie after 3 deep breaths", "difficulty": "easy"}
    ],
    "anxious": [
        {"title": "Take a photo of your hands holding something soft", "difficulty": "easy"},
        {"title": "Snap a picture of a safe corner in your room", "difficulty": "easy"},
        {"title": "Take a photo of your journal with one word written", "difficulty": "medium"}
    ],
    "sad": [
        {"title": "Take a selfie with a small smile", "difficulty": "easy"},
        {"title": "Snap a picture of sunlight through a window", "difficulty": "easy"},
        {"title": "Take a photo of a song playing on your phone", "difficulty": "easy"}
    ],
    "angry": [
        {"title": "Take a photo of crumpled paper after writing & tearing", "difficulty": "easy"},
        {"title": "Snap your shoes after stepping outside", "difficulty": "easy"},
        {"title": "Take a picture of water running in a sink", "difficulty": "easy"}
    ],
    "substance": [
        {"title": "Take a photo of your water bottle after refilling", "difficulty": "easy"},
        {"title": "Snap a picture of a healthy snack you chose", "difficulty": "easy"},
        {"title": "Take a selfie after a 5-minute walk", "difficulty": "easy"},
        {"title": "Take a photo of your phone on Do Not Disturb", "difficulty": "easy"}
    ],
    "default": [
        {"title": "Take a photo of your shoes by the door", "difficulty": "easy"},
        {"title": "Snap a picture of a tree or plant", "difficulty": "easy"},
        {"title": "Take a selfie with a glass of water", "difficulty": "easy"}
    ]
}

def generate_task_with_gemini(issue, user_text=""):
    if not USE_GEMINI:
        # Fallback: pick random safe task
        pool = FALLBACK_TASKS.get(issue, FALLBACK_TASKS["default"])
        task = random.choice(pool)
        return {
            "title": task["title"],
            "difficulty": task["difficulty"],
            "badge": f"{issue.capitalize()} Step I"
        }

    try:
        model = genai.GenerativeModel("gemini-2.0-flash")  # Updated model name
        prompt = f"""
        A person is struggling with '{issue}' and said: "{user_text[:100]}..."
        Suggest ONE very short, kind, photo-verifiable recovery task.
        Rules:
        - Must be doable in under 5 minutes
        - Must be verifiable by a photo
        - Do NOT suggest calling, journaling, or anything private
        - Do NOT suggest drugs, alcohol, or intense exercise
        - Use warm, encouraging language
        - Start with: "Take a photo of..." or "Snap a picture of..."
        - Keep it under 100 characters

        Example: "Take a photo of your water bottle after drinking."
        Now suggest one:
        """

        response = model.generate_content(prompt)
        title = response.text.strip()

        # Clean up quotes
        for chars in ['"', '“”', '""']:
            if title.startswith(chars[0]) and title.endswith(chars[1]):
                title = title[1:-1]

        # Truncate if too long
        title = title[:120]

        return {
            "title": title,
            "difficulty": "easy",  # All micro-tasks are easy
            "badge": f"{issue.capitalize()} Step I"
        }

    except Exception as e:
        print("Gemini error:", str(e))
        # Fallback to rule-based
        pool = FALLBACK_TASKS.get(issue, FALLBACK_TASKS["default"])
        task = random.choice(pool)
        return {
            "title": task["title"],
            "difficulty": task["difficulty"],
            "badge": f"{issue.capitalize()} Step I"
        }

def suggest_task_from_issues(detected_issues, user_text=""):
    for issue in ["substance", "angry", "anxious", "stress", "sad"]:
        if issue in detected_issues:
            return generate_task_with_gemini(issue, user_text)
    return generate_task_with_gemini("default", user_text)