import sys
import unittest

from app import create_app
from flask_script import Manager, Server


manager = Manager(create_app)
manager.add_command('runserver', Server(host='0.0.0.0', port=5000))


@manager.option('-a', '--app', dest='app_name', default='.',
                help='run tests for a particuler app')
def test(app_name):
    """ Runs the unittests. """
    tests = unittest.TestLoader().discover(app_name, pattern='tests.py')
    result = unittest.TextTestRunner(verbosity=2).run(tests)
    sys.exit(not result.wasSuccessful())


if __name__ == '__main__':
    manager.run()
