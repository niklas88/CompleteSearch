from app import app
from flask_testing import TestCase


class IndexViewTest(TestCase):
    def create_app(self):
        app.config['TESTING'] = True
        return app

    # def test_index_view(self):
    #     response = self.client.get('/')
    #     self.assertEqual(self.get_context_variable('VIEW'), 'index')
    #     self.assert200(response)
    #
    # def test_configure_view(self):
    #     # TODO: set is_uploaded = True
    #     response = self.client.get('/')
    #     self.assertEqual(self.get_context_variable('VIEW'), 'configure')
    #     self.assert200(response)

    def test_search_view(self):
        # TODO: set is_configured = True
        response = self.client.get('/')
        self.assertEqual(self.get_context_variable('VIEW'), 'search')
        self.assert200(response)


class FacetsTest(TestCase):
    def create_app(self):
        app.config['TESTING'] = True
        return app

    def test_get_facets(self):
        response = self.client.get('/get_facets/')
        self.assert200(response)
