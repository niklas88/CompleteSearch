import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Config:
    TESTING = False
    UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')
    ALLOWED_EXTENSIONS = set(['txt', 'xml', 'csv', 'tsv'])


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


class TestingConfig(Config):
    TESTING = True
