from app import create_app
from flask_script import Manager

import sys
import unittest

manager = Manager(create_app())


@manager.option('-a', '--app', dest='app_name', default='.',
                help='run tests for a particuler app')
def test(app_name):
    """ Runs the unittests. """
    tests = unittest.TestLoader().discover(app_name, pattern='tests.py')
    result = unittest.TextTestRunner(verbosity=2).run(tests)
    sys.exit(not result.wasSuccessful())


if __name__ == '__main__':
    manager.run()
