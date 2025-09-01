# backend/models/user.py
from werkzeug.security import generate_password_hash, check_password_hash
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
        hashed = generate_password_hash(password)  # Uses scrypt by default
        users_collection.insert_one({
            "email": email,
            "username": username,
            "password": hashed,
            "role": role
        })
        return True