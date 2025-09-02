# routes/submit_task.py
from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
import uuid, os

from utils.db import users_collection   # ✅ import from db.py
from utils.verify import matches_task  # ✅ put your AI verification logic in utils/verifier.py

submit_bp = Blueprint("submit_bp", __name__)

@submit_bp.route('/api/submit-task', methods=['POST'])
def submit_task():
    user_id = request.form.get('user_id')
    task_id = request.form.get('task_id')
    photo = request.files.get('photo')

    if not all([user_id, task_id, photo]):
        return jsonify({"error": "user_id, task_id, and photo required"}), 400

    # Save photo
    filename = f"static/photos/{user_id}_{task_id}_{uuid.uuid4().hex}.jpg"
    os.makedirs("static/photos", exist_ok=True)
    photo.save(filename)

    # Find user and task
    user = users_collection.find_one({"user_id": user_id, "tasks.task_id": task_id})
    if not user:
        return jsonify({"error": "Task not found"}), 404

    task = next(t for t in user["tasks"] if t["task_id"] == task_id)

    # ✅ Allow retry only if rejected
    if task["status"] == "approved":
        return jsonify({"error": "Task already approved. Cannot resubmit."}), 400
    if task["status"] not in ["pending", "rejected"]:
        return jsonify({"error": "Task status not allowed for resubmission"}), 400

    # ✅ AI Verify the photo
    verification = matches_task(filename, task["title"])

    if not verification["verified"]:
        users_collection.update_one(
            {"user_id": user_id, "tasks.task_id": task_id},
            {
                "$set": {
                    "tasks.$.status": "rejected",
                    "tasks.$.photo_url": filename,
                    "tasks.$.feedback": verification.get("reason", "Photo does not match task"),
                    "tasks.$.verified_at": datetime.now(timezone.utc)
                }
            }
        )
        return jsonify({
            "status": "rejected",
            "message": "Photo verification failed",
            "reason": verification.get("reason", "Does not match task"),
            "confidence": verification.get("confidence", 0)
        }), 400

    # ✅ Approved! Finalize task
    badge_name = task["badge"]
    badge_image = f"static/badges/{badge_name.lower().replace(' ', '_')}.png"
    os.makedirs("static/badges", exist_ok=True)

    users_collection.update_one(
        {"user_id": user_id, "tasks.task_id": task_id},
        {
            "$set": {
                "tasks.$.status": "approved",
                "tasks.$.photo_url": filename,
                "tasks.$.completed_at": datetime.now(timezone.utc),
                "tasks.$.ai_verified": True,
                "tasks.$.confidence": verification["confidence"]
            },
            "$push": {
                "badges": {
                    "badge": badge_name,
                    "image": badge_image,
                    "earned_at": datetime.now(timezone.utc)
                }
            },
            "$inc": {"streak": 1}
        }
    )

    return jsonify({
        "status": "approved",
        "badge_awarded": badge_name,
        "photo_url": filename,
        "streak": user.get("streak", 0) + 1,
        "message": "Great job! Your task was verified and approved 🎉",
        "confidence": verification["confidence"]
    })
