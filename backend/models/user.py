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
        users_collection.insert_one({
            "email": email,
            "username": username,
            "password": password,  # ✅ Already hashed
            "role": role
        })
        return True