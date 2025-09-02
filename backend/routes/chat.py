from flask import Blueprint, request, jsonify
from datetime import datetime
from utils.db import users_collection
from utils.gemini_chatbot import get_chat_response

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()

    user_id = data.get('user_id')
    message = data.get('message', '').strip()

    if not user_id or not message:
        return jsonify({"error": "user_id and message are required"}), 400

    # 📥 Fetch existing chat history (last 10 messages)
    user_doc = users_collection.find_one(
        {"user_id": user_id},
        {"chat_history": {"$slice": -10}}
    )

    gemini_history = []
    if user_doc and (chats := user_doc.get("chat_history")):
        for entry in chats:
            gemini_history.append({"role": "user", "parts": [entry["user"]]})
            gemini_history.append({"role": "model", "parts": [entry["bot"]]})

    # 🤖 Call Gemini (stub function for now)
    bot_reply = get_chat_response(message, chat_history=gemini_history)

    # Save chat entry
    chat_entry = {
        "timestamp": datetime.utcnow(),
        "user": message,
        "bot": bot_reply
    }

    users_collection.update_one(
        {"user_id": user_id},
        {
            "$setOnInsert": {"created_at": datetime.utcnow()},
            "$push": {
                "chat_history": {"$each": [chat_entry], "$slice": -50}
            }
        },
        upsert=True
    )

    return jsonify({
        "user_id": user_id,
        "reply": bot_reply,
        "timestamp": chat_entry["timestamp"].isoformat() + "Z"
    }), 200
