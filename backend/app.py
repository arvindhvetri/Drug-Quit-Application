# backend/app.py
from flask import Flask
from flask_cors import CORS
from routes.auth import auth_bp
from routes.blogs import blogs_bp
from routes.chat import chat_bp
from routes.mood_routes import mood_bp
from routes.suggest_task import suggest_bp
from routes.submit_task import submit_bp
from routes.profile import profile_bp
from routes.sobriety import sobriety_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(auth_bp, url_prefix='/')
    app.register_blueprint(blogs_bp, url_prefix='/')
    app.register_blueprint(chat_bp, url_prefix='/')
    app.register_blueprint(mood_bp, url_prefix='/')
    app.register_blueprint(suggest_bp, url_prefix='/')
    app.register_blueprint(submit_bp, url_prefix='/')
    app.register_blueprint(profile_bp, url_prefix='/')
    app.register_blueprint(sobriety_bp, url_prefix='/')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)