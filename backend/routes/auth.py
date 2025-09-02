# backend/routes/auth.py
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models.user import User
from config import Config

auth_bp = Blueprint('auth', __name__)

# backend/routes/auth.py
@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email', '').strip()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    token = data.get('token', '').strip()

    if not email or not username or not password:
        return jsonify({"message": "Email, username, and password are required"}), 400

    # Check if user already exists
    if User.find_by_username(username) or User.find_by_email(email):
        return jsonify({"message": "User already exists"}), 400

    # Determine role
    role = 'admin' if token == Config.ADMIN_TOKEN else 'user'

    # ✅ Hash the password with scrypt
    hashed_password = generate_password_hash(password)

    # Save user
    user_id = User.create_user(email, username, hashed_password, role)

    return jsonify({
        "message": "User created successfully",
        "role": role,
        "user_id": str(user_id)
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    identifier = data.get('identifier', '').strip()
    password = data.get('password', '').strip()

    user = User.find_by_username(identifier) or User.find_by_email(identifier)

    # backend/routes/auth.py
    if user and check_password_hash(user['password'], password):
        return jsonify({
            "message": "Login successful",
            "role": user['role'],
            "username": user['username'],
            "user_id": user['user_id']
        }), 200

    return jsonify({"message": "Invalid credentials"}), 401