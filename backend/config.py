# backend/config.py
import os
from dotenv import load_dotenv
load_dotenv()

class Config:
    ADMIN_TOKEN = "A1B2C3"  # Change in production
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")