# backend/routes/tasks.py
from flask import Blueprint, request, jsonify , send_from_directory
from utils.tasks import suggest_task_from_issues
from utils.verify import matches_task
import os
import uuid

tasks_bp = Blueprint('tasks', __name__)

# Ensure upload folder exists
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# POST /api/tasks/suggest
@tasks_bp.route('/api/tasks/suggest', methods=['POST'])
def suggest_task():
    data = request.json
    issues = data.get('issues', [])
    text = data.get('text', '')

    task = suggest_task_from_issues(issues, text)
    return jsonify(task)

# POST /api/tasks/verify
@tasks_bp.route('/api/tasks/verify', methods=['POST'])
def verify_task():
    data = request.json
    task_text = data.get('task_text')
    photo_path = data.get('photo_path')  # In prod, this will be a file upload

    # ⚠️ For demo: assume photo is saved locally
    if not os.path.exists(photo_path):
        return jsonify({"verified": False, "error": "Photo not found"})

    result = matches_task(photo_path, task_text)
    return jsonify(result)

# POST /api/tasks/upload
@tasks_bp.route('/api/tasks/upload', methods=['POST'])
def upload_photo():
    if 'photo' not in request.files:
        return jsonify({"error": "No photo uploaded"}), 400

    file = request.files['photo']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Save with unique name
    ext = file.filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    return jsonify({
        "photo_path": filepath,
        "url": f"/uploads/{filename}"
    })


# GET /uploads/<filename> (serve uploaded images)
@tasks_bp.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)