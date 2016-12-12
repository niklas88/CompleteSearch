import os
import json


def db_is_uploaded(app):
    """ Check if input file (db) is uploaded. """
    return os.path.isfile(app.config['INPUT_CSV_PATH'])


def db_is_configured(app):
    """ Check if the uploaded db is configured.  """
    return os.path.isfile(app.config['SETTINGS_PATH'])


def load_settings(app):
    """ Load setting from the settings file. """
    settings = {}
    if os.path.isfile(app.config['SETTINGS_PATH']):
        with open(app.config['SETTINGS_PATH'], 'r') as f:
            settings = json.loads(f.read())
    return settings
