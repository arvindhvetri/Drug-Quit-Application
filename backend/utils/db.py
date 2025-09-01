# backend/utils/db.py
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb+srv://<user_name>:<pass>@quitdrugsdb.s8v80vq.mongodb.net/")
db = client['drug_quit_app']

# Collections
users_collection = db['users']
blogs_collection = db['blogs']