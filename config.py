import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SETTINGS_DIR = os.path.join(BASE_DIR, 'settings.json')


class Config:
    TESTING = False
    BASE_DIR = BASE_DIR
    UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')
    ALLOWED_EXTENSIONS = ('txt', 'csv', 'tsv',)


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


class TestingConfig(Config):
    TESTING = True
