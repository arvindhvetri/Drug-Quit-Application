# utils/blog_helper.py
import feedparser
import requests
from google.generativeai import GenerativeModel
from datetime import datetime
import os
from config import Config

# Configure Gemini
import google.generativeai as genai
genai.configure(api_key=Config.GOOGLE_API_KEY)
model = GenerativeModel("gemini-2.0-flash")

def fetch_reddit_recovery_posts(limit=10):
    """
    Fetch recent posts from r/stopdrinking
    """
    feed = feedparser.parse("https://www.reddit.com/r/stopdrinking/.rss")
    entries = []
    for entry in feed.entries[:limit]:
        # Extract plain text from description (remove HTML)
        summary = entry.summary.replace("<p>", "").replace("</p>", "").strip()
        entries.append({
            "title": entry.title,
            "raw_content": summary,
            "source": "Reddit/r/stopdrinking",
            "link": entry.link,
            "date": datetime.now().strftime("%b %d, %Y")
        })
    return entries

def rewrite_with_gemini(title, content):
    """
    Use Gemini to rewrite content in a warm, recovery-focused tone
    """
    prompt = f"""
    Rewrite the following personal recovery story in a warm, heartfelt, and encouraging tone.
    Keep it real, but make it feel like someone sharing hope with a friend.
    Use simple language. Add a little encouragement at the end.
    Do not use markdown. Return plain text.

    Title: {title}
    Story: {content}

    Rewritten Story:
    """
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini error: {e}")
        return content  # fallback to original

def generate_blog_from_source():
    """
    Fetch real posts → rewrite with Gemini → return clean blog
    """
    posts = fetch_reddit_recovery_posts(limit=5)
    blogs = []
    for post in posts:
        rewritten = rewrite_with_gemini(post["title"], post["raw_content"])
        blogs.append({
            "title": post["title"],
            "excerpt": rewritten[:300] + "..." if len(rewritten) > 300 else rewritten,
            "content": rewritten,
            "author": "Community Member",
            "source": post["source"],
            "link": post["link"],
            "readTime": f"{len(rewritten.split()) // 200 + 1} min read",
            "date": post["date"]
        })
    return blogs