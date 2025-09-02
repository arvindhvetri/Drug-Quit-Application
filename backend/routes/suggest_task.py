from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
import uuid
from utils.db import users_collection  # import your MongoDB collection
from utils.tasks import suggest_task_from_issues  # assume you have this in utils

# Define Blueprint
suggest_bp = Blueprint("suggest_bp", __name__)

@suggest_bp.route('/api/suggest-task', methods=['GET'])
def suggest_task():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id required"}), 400

    user = users_collection.find_one({"user_id": user_id})
    if not user or not user.get("mood_history"):
        return jsonify({"error": "No mood data found"}), 404

    # Get latest detected issues
    latest_entry = user["mood_history"][-1]
    detected_issues = latest_entry.get("detected_issues", {})

    task = suggest_task_from_issues(detected_issues)

    # Generate unique task ID
    task_id = f"task_{uuid.uuid4().hex[:8]}"
    task["task_id"] = task_id
    task["status"] = "pending"
    task["assigned_at"] = datetime.now(timezone.utc)

    # Insert into user's tasks
    users_collection.update_one(
        {"user_id": user_id},
        {"$push": {"tasks": task}}
    )

    return jsonify({
        "task": task["title"],
        "category": [k for k in detected_issues.keys() if k in ["stress", "anxious", "sad", "angry"]][0:1],
        "difficulty": task["difficulty"],
        "task_id": task_id,
        "message": "You've got this! Complete it and upload proof."
    })