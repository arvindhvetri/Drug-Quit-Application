# backend/routes/sobriety.py
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import uuid
import os
from werkzeug.utils import secure_filename
from utils.sobriety import analyze_sobriety  # ← Import from your module
from utils.db import users_collection

sobriety_bp = Blueprint('sobriety', __name__)

@sobriety_bp.route('/api/sobriety-check', methods=['POST'])
def sobriety_check():
    """
    POST /api/sobriety-check
    Form-data:
      - user_id: string
      - selfie: image file
    Returns sobriety analysis (once per day)
    """
    user_id = request.form.get('user_id')
    image_file = request.files.get('selfie')

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    if not image_file:
        return jsonify({"error": "selfie image is required"}), 400

    # Validate file extension
    allowed_extensions = {'jpg', 'jpeg', 'png'}
    filename = image_file.filename.lower()
    if not any(filename.endswith(ext) for ext in allowed_extensions):
        return jsonify({"error": "Only .jpg, .jpeg, .png images allowed"}), 400

    # -------------------------------
    # Rate Limit: Once per 24 hours
    # -------------------------------
    user = users_collection.find_one({"user_id": user_id})
    if user and "last_sobriety_check" in user:
        last_check = user["last_sobriety_check"]
        next_allowed = last_check + timedelta(days=1)
        now = datetime.utcnow()
        if now < next_allowed:
            hours_left = int((next_allowed - now).total_seconds() // 3600)
            return jsonify({
                "error": "Sobriety check available once per day",
                "available_in_hours": max(1, hours_left)
            }), 429  # Too Many Requests

    # -------------------------------
    # Save Image Temporarily
    # -------------------------------
    os.makedirs("uploads/selfies", exist_ok=True)
    file_ext = os.path.splitext(filename)[1]
    safe_filename = f"{uuid.uuid4().hex}{file_ext}"
    filepath = os.path.join("uploads/selfies", safe_filename)

    try:
        image_file.save(filepath)
    except Exception as e:
        return jsonify({"error": f"Failed to save image: {str(e)}"}), 500

    # -------------------------------
    # Analyze Sobriety
    # -------------------------------
    try:
        result = analyze_sobriety(filepath)
        if "error" in result:
            # Clean up
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify(result), 400

        # -------------------------------
        # Save Result to MongoDB
        # -------------------------------
        sobriety_entry = {
            "timestamp": datetime.utcnow(),
            "is_sober": result["is_sober"],
            "flags": result["flags"],
            "image_analysis": result["image_analysis"]
        }

        users_collection.update_one(
            {"user_id": user_id},
            {
                "$set": {"last_sobriety_check": datetime.utcnow()},
                "$push": {"sobriety_results": sobriety_entry}
            },
            upsert=True
        )

        # -------------------------------
        # Clean Up: Delete Image After Analysis
        # -------------------------------
        if os.path.exists(filepath):
            os.remove(filepath)

        # -------------------------------
        # Return Success Response
        # -------------------------------
        return jsonify({
            "user_id": user_id,
            "is_sober": result["is_sober"],
            "flags": result["flags"],
            "analysis": result["image_analysis"],
            "timestamp": sobriety_entry["timestamp"].isoformat() + "Z"
        })

    except Exception as e:
        # Clean up on error
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500