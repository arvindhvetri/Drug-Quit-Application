from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid, os
from utils.db import users_collection
from utils.sentiment import analyze_sentiment
from utils.voice import convert_voice_to_text
from utils.keywords import check_keywords

mood_bp = Blueprint("mood", __name__)

@mood_bp.route('/api/analyze', methods=['POST'])
def analyze_input():
    data = request.form
    user_id = data.get('user_id')

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    text_input = data.get('text', '')
    questionnaire = request.form.getlist('questionnaire[]')

    voice_file = request.files.get('voice')
    voice_text = ""
    if voice_file:
        filename = f"uploads/{user_id}_{uuid.uuid4().hex}.ogg"
        os.makedirs("uploads", exist_ok=True)
        voice_file.save(filename)
        voice_text = convert_voice_to_text(filename)
        os.remove(filename)

    full_text = " ".join(filter(None, [text_input, voice_text, *questionnaire]))
    if not full_text.strip():
        return jsonify({"error": "No valid input provided"}), 400

    sentiment_result = analyze_sentiment(full_text)
    risk_keywords = check_keywords(full_text)

    mood_entry = {
        "timestamp": datetime.utcnow(),
        "input_text": full_text,
        "sentiment": sentiment_result,
        "detected_issues": risk_keywords,
        "raw_inputs": {
            "text": text_input,
            "voice_transcript": voice_text,
            "questionnaire": questionnaire
        }
    }

    users_collection.update_one(
        {"user_id": user_id},
        {
            "$setOnInsert": {
                "created_at": datetime.utcnow(),
                "tasks": [],
                "badges": [],
                "streak": 0
            },
            "$push": {"mood_history": mood_entry}
        },
        upsert=True
    )

    return jsonify({
        "user_id": user_id,
        "mood": sentiment_result["mood"],
        "polarity": sentiment_result["polarity"],
        "detected_issues": risk_keywords,
        "emotion": sentiment_result["emotion"],
        "timestamp": mood_entry["timestamp"].isoformat()
    }), 200
