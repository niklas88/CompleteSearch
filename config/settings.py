import subprocess
import json
import os


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Get Docker Machine IP
proc = subprocess.run(
    ['docker-machine', 'ip', 'default'],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE
)

# Raise an error if there was a problem with Docker Machine
if proc.stderr != b'':
    error = proc.stderr.decode('utf-8').replace('\n', '')
    raise Exception(error)

IP = proc.stdout.decode('utf-8').replace('\n', '')


# Get DB settings
settings_file = os.path.join(BASE_DIR, 'data/settings.json')
if os.path.isfile(settings_file):
    with open(settings_file, 'r') as f:
        SETTINGS = json.loads(f.read())


class Config:
    TESTING = False
    BASE_DIR = BASE_DIR
    UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')
    ALLOWED_EXTENSIONS = ('txt', 'xml', 'csv', 'tsv',)
    DOCKER_MACHINE_IP = IP
    DOCKER_MACHINE_PORT = '8888'
    SETTINGS = SETTINGS if SETTINGS else {}


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


class TestingConfig(Config):
    TESTING = True
