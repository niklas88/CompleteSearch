from flask import Flask

from common.logging import handler
from common.views import bp as common_bp
from upload.views import bp as upload_bp
from search.views import bp as search_bp


def create_app(config='Config'):
    # Create main Flask app
    app = Flask(__name__, static_path='/static')

    # Load settings
    app.config.from_object('config.' + config)

    # Register Blueprints
    app.register_blueprint(common_bp)
    app.register_blueprint(upload_bp)
    app.register_blueprint(search_bp)

    # Set logger
    app.logger.addHandler(handler)

    return app


app = create_app()


if __name__ == '__main__':
    app.run()
