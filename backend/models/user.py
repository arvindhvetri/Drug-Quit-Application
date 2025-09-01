# backend/models/user.py
from utils.db import users_collection

class User:
    @staticmethod
    def find_by_username(username):
        return users_collection.find_one({"username": username})

    @staticmethod
    def find_by_email(email):
        return users_collection.find_one({"email": email})

    @staticmethod
    def create_user(email, username, password, role='user'):
        user = {
            "email": email,
            "username": username,
            "password": password,
            "role": role,
        }
        result = users_collection.insert_one(user)

        # Get Mongo's generated _id
        mongo_id = result.inserted_id

        # Update the document to also store it as "user_id"
        users_collection.update_one(
            {"_id": mongo_id},
            {"$set": {"user_id": str(mongo_id)}}
        )

        return mongo_id