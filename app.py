import os
import json

from flask import Flask, jsonify

from common.logging import handler
from common.views import bp as common_bp
from upload.views import bp as upload_bp
from search.views import bp as search_bp
from settings.views import bp as settings_bp


class Settings:
    """ A class with CompleteSearch settings. """
    def __init__(self, settings_dir):
        self._settings_dir = settings_dir
        self._settings_empty = {
            'database_uploaded': False,
            'title_field': '',
            'within_field_separator': '',
            'full_text': [],
            'allow_multiple_items': [],
            'show': [],
            'filter': [],
            'facets': [],
            'all_fields': [],
        }

        # Read the settings file
        if os.path.isfile(self._settings_dir):
            with open(self._settings_dir, 'r') as f:
                self._settings = json.loads(f.read())
        else:
            # Create a file with default settings
            with open(self._settings_dir, 'w') as f:
                self._settings = self._settings_empty
                f.write(json.dumps(self._settings, indent=4, sort_keys=True))

    def to_dict(self):
        """ Return a dictionary with settings. """
        return self._settings

    def reset(self):
        """ Reset all settings. """
        with open(self._settings_dir, 'w') as f:
            self._settings = self._settings_empty
            f.write(json.dumps(self._settings, indent=4, sort_keys=True))

    def save(self):
        """ Save dictionary with settings to the settings file. """
        with open(self._settings_dir, 'w') as f:
            f.write(json.dumps(self._settings, indent=4, sort_keys=True))


class ServerError(Exception):
    status_code = 500

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv


def create_app(config='Config'):
    # Create main Flask app
    app = Flask(__name__, static_path='/static')

    # Load config
    app.config.from_object('config.%s' % config)

    # Load settings
    app.settings = Settings(app.config['SETTINGS_DIR'])

    # Register Blueprints
    app.register_blueprint(common_bp)
    app.register_blueprint(upload_bp)
    app.register_blueprint(search_bp)
    app.register_blueprint(settings_bp)

    # Set logger
    if config != 'TestingConfig':
        app.logger.addHandler(handler)

    app.ServerError = ServerError

    @app.errorhandler(ServerError)
    def handle_invalid_usage(error):
        response = jsonify(error.to_dict())
        response.status_code = error.status_code
        return response

    return app


app = create_app()


if __name__ == '__main__':
    app.run()
