import sys
import unittest

from app import create_app
from flask_script import Manager, Server, Command, Option
from gunicorn.app.base import Application


class GunicornServer(Command):
    """ Runs the app within Gunicorn """

    def __init__(self, host='127.0.0.1', port=8000, workers=4):
        self.port = port
        self.host = host
        self.workers = workers

    def get_options(self):
        return (
            Option('-h', '--host',
                   dest='host',
                   default=self.host),

            Option('-p', '--port',
                   dest='port',
                   type=int,
                   default=self.port),

            Option('-w', '--workers',
                   dest='workers',
                   type=int,
                   default=self.workers),
        )

    def __call__(self, app, host, port, workers):
        class FlaskApplication(Application):
            def init(self, parser, opts, args):
                return {
                    'bind': '{0}:{1}'.format(host, port),
                    'workers': workers
                }

            def load(self):
                return app

        FlaskApplication().run()


manager = Manager(create_app)
manager.add_command('runserver', Server())
manager.add_command('gunicorn', GunicornServer())


@manager.option('-a', '--app', dest='app_name', default='.',
                help='run tests for a particuler app')
def test(app_name):
    """ Runs the unittests. """
    tests = unittest.TestLoader().discover(app_name, pattern='tests.py')
    result = unittest.TextTestRunner(verbosity=2).run(tests)
    sys.exit(not result.wasSuccessful())


if __name__ == '__main__':
    manager.run()
