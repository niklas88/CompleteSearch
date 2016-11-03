from flask import Flask
from config.logging import handler


# Create main Flask app
app = Flask(__name__)

# Load settings
app.config.from_object('config.settings.Config')

# Set logger
app.logger.addHandler(handler)

# Import all views (modules)
from views import common
from views import upload
