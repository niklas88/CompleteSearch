import os
import json

from flask import Flask

from common.logging import handler
from common.views import bp as common_bp
from upload.views import bp as upload_bp
from search.views import bp as search_bp
from settings.views import bp as settings_bp


class Settings:
    """ A class with CompleteSearch settings. """
    def __init__(self, settings_dir):
        self._settings_dir = settings_dir

        if os.path.isfile(self._settings_dir):
            with open(self._settings_dir, 'r') as f:
                self._settings = json.loads(f.read())
        else:
            # Create a file with default settings
            with open(self._settings_dir, 'w') as f:
                settings = {
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
                f.write(json.dumps(settings, indent=4, sort_keys=True))
                self._settings = settings

    def to_dict(self):
        """ Return a dictionary with settings. """
        return self._settings

    def save(self):
        """ Save dictionary with settings to the settings file. """
        with open(self._settings_dir, 'w') as f:
            f.write(json.dumps(self._settings, indent=4, sort_keys=True))


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

    return app


app = create_app()


if __name__ == '__main__':
    app.run()
