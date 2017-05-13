import os
import io

from app import create_app
from flask_testing import TestCase

INPUT1 = b"""Land,Hauptstadt,Einwohnerzahl
Deutschland,Berlin,82175684
Frankreich,Paris,66317994
Italien,Rom,60588658
"""

OUTPUT1 = """Land	Hauptstadt	Einwohnerzahl
Deutschland	Berlin	82175684
Frankreich	Paris	66317994
Italien	Rom	60588658
"""


class UploadFileTest(TestCase):
    def create_app(self):
        self.app = create_app('TestingConfig')
        return self.app

    def test_file_upload(self):
        response = self.client.post('/upload_file/', data={
            'file': (io.BytesIO(INPUT1), 'input.csv')
        }, content_type='multipart/form-data')
        self.assert200(response)
        self.assertEquals(response.json, {
            'success': True,
            'error': '',
            'data': {
                'all_fields': ['Land', 'Hauptstadt', 'Einwohnerzahl'],
                'full_text': ['Land', 'Hauptstadt', 'Einwohnerzahl'],
                'database_uploaded': True,
                'facets': [],
                'filter': [],
                'show': [],
            },
        })

        result_path = os.path.join(
            self.app.config['BASE_DIR'], 'test_data', 'test_result.csv',
        )

        with open(result_path, 'r') as res:
            self.assertEquals(OUTPUT1, res.read())
            os.remove(result_path)

    def test_no_file(self):
        response = self.client.post('/upload_file/')
        self.assert200(response)
        self.assertEquals(response.json, {
            'success': False,
            'error': 'You did not select any file.',
            'data': {},
        })

    def test_empty_file(self):
        response = self.client.post('/upload_file/', data={
            'file': (io.BytesIO(b''), 'input.csv')
        }, content_type='multipart/form-data')
        self.assert200(response)
        self.assertEquals(response.json, {
            'success': False,
            'error': 'The file is empty.',
            'data': {},
        })

    def test_wrong_file_type(self):
        response = self.client.post('/upload_file/', data={
            'file': (io.BytesIO(b'123'), 'image.png')
        }, content_type='multipart/form-data')
        self.assert200(response)
        self.assertEquals(response.json, {
            'success': False,
            'error': 'Wrong file type.',
            'data': {},
        })

    def test_unknown_delimiter(self):
        response = self.client.post('/upload_file/', data={
            'file': (io.BytesIO(b'col1~col2~col3\n1~2~3'), 'input.csv')
        }, content_type='multipart/form-data')
        self.assert200(response)
        self.assertEquals(response.json, {
            'success': False,
            'error': 'Could not determine delimiter',
            'data': {},
        })


class SaveUploadedDatasetTest(TestCase):
    def create_app(self):
        self.app = create_app('TestingConfig')
        return self.app

    def test_missing_data(self):
        response = self.client.post('/save_uploaded_dataset/')
        self.assert200(response)
        self.assertEquals(response.json, {
            'success': False,
            'error': 'Data is missing.',
        })
