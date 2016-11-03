from logging import Formatter, INFO
from logging.handlers import RotatingFileHandler


handler = RotatingFileHandler(
    filename='app.log',
    maxBytes=15 * 1024 * 1024,  # 15 MB
    backupCount=2
)

handler.setFormatter(Formatter(
    '[%(levelname)s] [%(asctime)s] [%(pathname)s:%(lineno)d]: %(message)s',
    datefmt='%d/%b/%Y %H:%M:%S'
))

handler.setLevel(INFO)
