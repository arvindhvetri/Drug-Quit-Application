# backend/utils/db.py
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client['drug_quit_app']

# Collections
users_collection = db['users']
blogs_collection = db['blogs']