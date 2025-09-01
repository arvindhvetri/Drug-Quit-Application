# backend/models/blog.py
from datetime import datetime
from bson import ObjectId
from utils.db import blogs_collection

class Blog:
    @staticmethod
    def get_all(limit=None):
        query = blogs_collection.find().sort("date", -1)
        if limit:
            query = query.limit(limit)
        return [{**blog, "_id": str(blog["_id"])} for blog in query]

    @staticmethod
    def create(title, excerpt, author, link=None):
        blog = {
            "title": title,
            "excerpt": excerpt,
            "author": author,
            "date": datetime.now().strftime("%b %d, %Y"),
            "readTime": f"{(len(excerpt.split()) // 200) + 1} min read",
            "link": link or None
        }
        result = blogs_collection.insert_one(blog)
        blog["_id"] = str(result.inserted_id)
        return blog

    @staticmethod
    def update(blog_id, title, excerpt, link=None):
        result = blogs_collection.find_one_and_update(
            {"_id": ObjectId(blog_id)},
            {
                "$set": {
                    "title": title,
                    "excerpt": excerpt,
                    "link": link or None,
                    "date": datetime.now().strftime("%b %d, %Y"),
                    "readTime": f"{(len(excerpt.split()) // 200) + 1} min read"
                }
            },
            return_document=True
        )
        if result:
            result["_id"] = str(result["_id"])
        return result

    @staticmethod
    def delete(blog_id):
        result = blogs_collection.delete_one({"_id": ObjectId(blog_id)})
        return result.deleted_count > 0