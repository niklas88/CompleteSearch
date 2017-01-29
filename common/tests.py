from app import create_app
from flask_testing import TestCase


class IndexView(TestCase):
    def create_app(self):
        self.app = create_app('TestingConfig')
        return self.app

    def setUp(self):
        self.app.settings.to_dict()['database_uploaded'] = False

    def test_index_view(self):
        response = self.client.get('/')
        self.assertEqual(self.get_context_variable('VIEW'), 'index')
        self.assert200(response)


class SearchView(TestCase):
    def create_app(self):
        self.app = create_app('TestingConfig')
        return self.app

    def setUp(self):
        self.app.settings.to_dict()['database_uploaded'] = True

    def test_search_view(self):
        response = self.client.get('/')
        self.assertEqual(self.get_context_variable('VIEW'), 'search')
        self.assert200(response)
