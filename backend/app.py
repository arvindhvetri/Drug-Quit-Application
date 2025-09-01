# backend/app.py
from flask import Flask
from flask_cors import CORS
from routes.auth import auth_bp
from routes.blogs import blogs_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/')
    app.register_blueprint(blogs_bp, url_prefix='/')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)