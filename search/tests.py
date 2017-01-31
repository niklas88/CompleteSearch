from app import create_app
from flask_testing import TestCase


# TODO@me: improve these tests
class FacetsTest(TestCase):
    def create_app(self):
        self.app = create_app('TestingConfig')
        return self.app

    def test_get_facets_list(self):
        response = self.client.get('/get_facets_list/')
        self.assert200(response)

    def test_get_facets(self):
        response = self.client.get('/get_facets/?name=%s' % 'Title')
        self.assert200(response)

    def test_get_facets_empty(self):
        response = self.client.get('/get_facets/')
        self.assert200(response)
