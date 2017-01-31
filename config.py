import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


class Config:
    TESTING = False
    BASE_DIR = BASE_DIR
    UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')
    ALLOWED_EXTENSIONS = ('txt', 'csv', 'tsv',)
    SETTINGS_DIR = os.path.join(BASE_DIR, 'settings.json')
    OUTPUT_PATH = os.path.join(BASE_DIR, '..', 'data', 'input.csv')


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


class TestingConfig(Config):
    TESTING = True
    PRESERVE_CONTEXT_ON_EXCEPTION = False
    SETTINGS_DIR = os.path.join(BASE_DIR, 'test_data', 'settings.json')
    OUTPUT_PATH = os.path.join(BASE_DIR, 'test_data', 'test_result.csv')
