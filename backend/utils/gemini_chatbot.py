# utils/gemini_chatbot.py

import google.generativeai as genai
from config import Config

genai.configure(api_key=Config.GOOGLE_API_KEY)

def get_chat_response(message: str, chat_history: list = None):
    """
    Get response from Gemini — allows any relevant link.
    :param message: Current user message
    :param chat_history: List of {"role": "...", "parts": ["..."]} for context
    :return: Bot reply (str), including links
    """
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction="""
You are a kind, helpful assistant.
- Answer clearly and supportively.
- If a website, guide, video, or resource can help, include the full link.
- Never make up URLs.
- For crisis: suggest 988 or text HOME to 741741.
- Ensure at least one helpful url is there
Keep responses concise (1-3 sentences).
        """
    )

    try:
        chat = model.start_chat(history=chat_history or [])
        response = chat.send_message(message)
        return response.text.strip()
    except Exception as e:
        return "I'm having trouble responding right now. Please try again later."