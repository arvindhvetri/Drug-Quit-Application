from flask import Blueprint, jsonify
from bson import ObjectId
from utils.db import users_collection

profile_bp = Blueprint("profile", __name__)

def serialize_user(user):
    user["_id"] = str(user["_id"])  # convert ObjectId to string
    return user

@profile_bp.route('/api/profile/<user_id>', methods=['GET'])
def user_profile(user_id):
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify(serialize_user(user))