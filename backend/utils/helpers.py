# utils/helpers.py
from utils.db import users_collection

def get_or_create_user(user_id):
    """
    Fetch user from MongoDB, or create a new one if not found.
    """
    user = users_collection.find_one({"user_id": user_id})
    if not user:
        new_user = {
            "user_id": user_id,
            "mood_history": [],
            "tasks": [],
            "badges": [],
            "streak": 0
        }
        users_collection.insert_one(new_user)
        return new_user
    return user