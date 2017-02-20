import os
import random
import string

from fabric.api import lcd, local

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def coverage():
    local('coverage run --source="." manage.py test')
    local('rm -rf htmlcov/')
    local('coverage html')
    local('open htmlcov/index.html')


def create_zip():
    git_url = 'https://github.com/anatskiy/tst.git'
    git_status = local('git status --porcelain', capture=True)

    with lcd(BASE_DIR):
        if any(git_status):
            exit('Working tree is not clean. Abort.')
        else:
            name = 'codebase-' + ''.join(
                random.choice(string.ascii_lowercase + string.digits)
                for _ in range(8)
            )

            print('\nRebuilding the client...')
            with lcd('client/'):
                local('gulp b --prod')
            print('...done!')

            print('\nCloning the codebase...')
            local('mkdir %s' % name)
            with lcd(name):
                local('git clone %s app' % git_url)
                local('rm -rf app/.git')
            print('...done!')

            print('\nCopying compiled assets...')
            local('cp -R {static/css,static/js} %s/app/static' % name)
            print('...done!')

            print('\nCreating ZIP archive...')
            with lcd(name):
                local('zip -r -X app.zip app')
                local('mv app.zip ../')
            print('...done!')

            print('\nCleaning up...')
            local('rm -rf %s' % name)
            print('...done!')
