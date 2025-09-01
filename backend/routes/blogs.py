# backend/routes/blogs.py
from flask import Blueprint, request, jsonify
from models.blog import Blog
from models.user import User

blogs_bp = Blueprint('blogs', __name__)

@blogs_bp.route('/user/blogs', methods=['GET'])
def get_user_blogs():
    blogs = Blog.get_all(limit=7)
    return jsonify(blogs), 200

@blogs_bp.route('/admin/blogs', methods=['GET'])
def get_admin_blogs():
    blogs = Blog.get_all()
    return jsonify(blogs), 200

@blogs_bp.route('/admin/blogs', methods=['POST'])
def add_blog():
    data = request.json
    username = data.get("username")
    print(username)
    user = User.find_by_username(username)

    if not user or user.get("role") != "admin":
        return jsonify({"message": "Unauthorized"}), 403

    title = data.get("title", "").strip()
    excerpt = data.get("excerpt", "").strip()

    if not title or not excerpt:
        return jsonify({"message": "Title and excerpt required"}), 400

    blog = Blog.create(title, excerpt, data.get("author", username))
    return jsonify(blog), 201

@blogs_bp.route('/admin/blogs/<blog_id>', methods=['DELETE'])
def delete_blog(blog_id):
    user = User.find_by_username(request.json.get("username"))
    if not user or user.get("role") != "admin":
        return jsonify({"message": "Unauthorized"}), 403

    if Blog.delete(blog_id):
        return jsonify({"message": "Blog deleted successfully"}), 200
    return jsonify({"message": "Blog not found"}), 404