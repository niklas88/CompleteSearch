import os


class Config:
    TESTING = False
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')
    ALLOWED_EXTENSIONS = ('txt', 'xml', 'csv', 'tsv',)


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


class TestingConfig(Config):
    TESTING = True
