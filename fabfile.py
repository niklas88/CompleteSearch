from fabric.api import lcd, local
from fabric.contrib.console import confirm


def build_client():
    if confirm('Rebuild client?'):
        with lcd('static/js/build/'):
            local('node r.js -o build.js')
