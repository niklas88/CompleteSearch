from app import create_app
from flask_testing import TestCase


class FacetsTest(TestCase):
    def create_app(self):
        self.app = create_app('TestingConfig')
        return self.app

    def test_get_facets_list(self):
        response = self.client.get('/get_facets_list/')
        self.assert200(response)

    # def test_no_facets_file(self):
    #     self.app.config['FACETS_PATH'] = 'non-existing-path'
    #     response = self.client.get('/get_facets/')
    #     self.assert200(response)
