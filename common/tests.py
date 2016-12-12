from app import create_app
from flask_testing import TestCase


class IndexView(TestCase):
    def create_app(self):
        self.app = create_app('TestingConfig')
        return self.app

    def setUp(self):
        self.app.config['INPUT_CSV_PATH'] = 'non-existing-path'
        self.app.config['SETTINGS_PATH'] = 'non-existing-path'

    def test_index_view(self):
        response = self.client.get('/')
        self.assertEqual(self.get_context_variable('VIEW'), 'index')
        self.assert200(response)


class ConfigureView(TestCase):
    def create_app(self):
        self.app = create_app('TestingConfig')
        return self.app

    def setUp(self):
        self.app.config['SETTINGS_PATH'] = 'non-existing-path'

    def test_configure_view(self):
        response = self.client.get('/')
        self.assertEqual(self.get_context_variable('VIEW'), 'configure')
        self.assert200(response)


class SearchView(TestCase):
    def create_app(self):
        self.app = create_app('TestingConfig')
        return self.app

    def test_search_view(self):
        response = self.client.get('/')
        self.assertEqual(self.get_context_variable('VIEW'), 'search')
        self.assert200(response)


class FacetsTest(TestCase):
    def create_app(self):
        self.app = create_app('TestingConfig')
        return self.app

    def test_get_facets(self):
        response = self.client.get('/get_facets/')
        self.assertNotEqual(response.json, 0)
        self.assert200(response)

    def test_no_facets_file(self):
        self.app.config['FACETS_PATH'] = 'non-existing-path'
        response = self.client.get('/get_facets/')
        self.assert200(response)
