import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Flask Config
FLASK_ENV = os.getenv("FLASK_ENV", "development")
FLASK_RUN_PORT = int(os.getenv("FLASK_RUN_PORT", 5000))

# API Keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
