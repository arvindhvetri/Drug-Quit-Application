# backend/routes/blogs.py
from flask import Blueprint, request, jsonify
from bson import ObjectId
from models.blog import Blog
from models.user import User
from utils.blog_helper import generate_blog_from_source

blogs_bp = Blueprint('blogs', __name__)

# GET: All blogs for users (public)
@blogs_bp.route('/user/blogs', methods=['GET'])
def get_user_blogs():
    """
    Fetch real recovery stories from web → Gemini-rewrite → return
    """
    try:
        blogs = generate_blog_from_source()
        return jsonify(blogs), 200
    except Exception as e:
        print(f"Error fetching blogs: {e}")
        return jsonify([]), 200  # Return empty list on error

# GET: All blogs for admin (full list)
@blogs_bp.route('/admin/blogs', methods=['GET'])
def get_admin_blogs():
    blogs = Blog.get_all()
    return jsonify(blogs), 200

# POST: Add a new blog (admin only)
@blogs_bp.route('/admin/blogs', methods=['POST'])
def add_blog():
    data = request.json
    username = data.get("username")

    # Verify admin
    user = User.find_by_username(username)
    if not user or user.get("role") != "admin":
        return jsonify({"message": "Unauthorized: Admins only"}), 403

    title = data.get("title", "").strip()
    excerpt = data.get("excerpt", "").strip()
    link = data.get("link", "").strip()

    if not title or not excerpt:
        return jsonify({"message": "Title and excerpt are required"}), 400

    blog = Blog.create(title, excerpt, user['username'], link)
    return jsonify(blog), 201

# PUT: Edit a blog (admin only)
@blogs_bp.route('/admin/blogs/<blog_id>', methods=['PUT'])
def edit_blog(blog_id):
    data = request.json
    username = data.get("username")

    # Verify admin
    user = User.find_by_username(username)
    if not user or user.get("role") != "admin":
        return jsonify({"message": "Unauthorized: Admins only"}), 403

    title = data.get("title", "").strip()
    excerpt = data.get("excerpt", "").strip()
    link = data.get("link", "").strip()

    if not title or not excerpt:
        return jsonify({"message": "Title and excerpt are required"}), 400

    # Update in DB
    result = Blog.update(blog_id, title, excerpt, link)
    if not result:
        return jsonify({"message": "Blog not found"}), 404

    return jsonify(result), 200

# DELETE: Delete a blog (admin only)
@blogs_bp.route('/admin/blogs/<blog_id>', methods=['DELETE'])
def delete_blog(blog_id):
    data = request.json
    username = data.get("username")

    # Verify admin
    user = User.find_by_username(username)
    if not user or user.get("role") != "admin":
        return jsonify({"message": "Unauthorized: Admins only"}), 403

    if Blog.delete(blog_id):
        return jsonify({"message": "Blog deleted successfully"}), 200
    return