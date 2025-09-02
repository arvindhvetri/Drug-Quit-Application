# utils/sentiment.py
from transformers import pipeline
import torch
import re

# Load emotion model once
classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    device=0 if torch.cuda.is_available() else -1
)

# Emoji to emotion mapping
EMOJI_TO_EMOTION = {
    "😊": "happy", "😄": "happy", "😁": "happy", "❤️": "loved", "💕": "loved",
    "🎉": "excited", "✨": "hopeful", "🌈": "hopeful", "🌟": "happy",
    "😢": "sad", "😭": "sad", "💔": "sad", "😞": "sad", "😔": "sad",
    "😡": "angry", "😠": "angry", "🤬": "angry",
    "😨": "anxious", "😰": "anxious", "😱": "anxious", "🤢": "anxious",
    "😴": "exhausted", "😪": "exhausted", "😷": "unwell",
    "😐": "neutral", "😑": "neutral", "😶": "neutral",
    "🤔": "thoughtful", "😕": "confused",
}

# Map emotion → polarity (-1 to +1)
EMOTION_TO_POLARITY = {
    "happy": 0.8,
    "excited": 0.9,
    "loved": 0.7,
    "hopeful": 0.6,
    "calm": 0.3,
    "neutral": 0.0,
    "thoughtful": 0.0,
    "confused": -0.1,
    "sad": -0.6,
    "anxious": -0.7,
    "exhausted": -0.5,
    "unwell": -0.4,
    "angry": -0.9,
    "surprised": 0.2  # context-dependent, but often positive
}

def detect_emotion_from_emoji(text):
    emojis = re.findall(r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF\U00002700-\U000027BF]', text)
    detected = [EMOJI_TO_EMOTION.get(emoji, None) for emoji in emojis]
    emotional = [e for e in detected if e and e not in ["neutral", "thoughtful", "confused"]]

    if emotional:
        from collections import Counter
        return Counter(emotional).most_common(1)[0][0]
    return None


def analyze_sentiment(text):
    original_text = text.strip()
    if not original_text:
        return {
            "polarity": 0.0,
            "mood": "neutral",
            "emotion": "neutral",
            "confidence": 0.0,
            "source": "empty_input"
        }

    # Step 1: Check emoji override
    emoji_emotion = detect_emotion_from_emoji(original_text)
    
    if emoji_emotion and emoji_emotion in ["happy", "sad", "angry", "anxious", "loved"]:
        polarity = EMOTION_TO_POLARITY.get(emoji_emotion, 0.0)
        mood = "positive" if polarity > 0.1 else "negative" if polarity < -0.1 else "neutral"
        
        return {
            "polarity": round(polarity, 3),
            "mood": mood,
            "emotion": emoji_emotion,
            "confidence": 0.9,  # High confidence from emoji
            "source": "emoji_override"
        }

    # Step 2: Use AI model on text
    try:
        result = classifier(original_text)[0]
        label = result['label']
        confidence = result['score']

        emotion_map = {
            "joy": "happy",
            "sadness": "sad",
            "anger": "angry",
            "fear": "anxious",
            "surprise": "surprised",
            "love": "loved",
            "neutral": "neutral"
        }

        emotion = emotion_map.get(label, "neutral")
        polarity = EMOTION_TO_POLARITY.get(emotion, 0.0)
        mood = "positive" if polarity > 0.1 else "negative" if polarity < -0.1 else "neutral"

        return {
            "polarity": round(polarity, 3),
            "mood": mood,
            "emotion": emotion,
            "confidence": round(confidence, 3),
            "source": "ai_model"
        }

    except Exception as e:
        print("Error in emotion detection:", str(e))
        return {
            "polarity": 0.0,
            "mood": "neutral",
            "emotion": "neutral",
            "confidence": 0.0,
            "source": "error"
        }