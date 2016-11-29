from flask import Flask
from config.logging import handler
import common
import upload
import search


# Create main Flask app
app = Flask(__name__, static_path='/static')

# Load settings
app.config.from_object('config.settings.Config')

# Register Blueprints
app.register_blueprint(common.bp)
app.register_blueprint(upload.bp)
app.register_blueprint(search.bp)

# Set logger
app.logger.addHandler(handler)


if __name__ == '__main__':
    app.run()
