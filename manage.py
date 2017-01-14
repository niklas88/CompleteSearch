from app import create_app
from flask_script import Manager

import sys
import unittest

manager = Manager(create_app())


@manager.command
def test():
    """ Run the unittests. """
    tests = unittest.TestLoader().discover('.', pattern='tests.py')
    result = unittest.TextTestRunner(verbosity=2).run(tests)
    sys.exit(not result.wasSuccessful())

if __name__ == '__main__':
    manager.run()
