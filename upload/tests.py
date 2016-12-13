from app import create_app
from flask_testing import TestCase

import io


class UploadFileTest(TestCase):
    def create_app(self):
        self.app = create_app('TestingConfig')
        return self.app

    def setUp(self):
        self.data = 'col1,col2,col3\napple,orange,banana\napple,orange,grape'

    def test_file_upload(self):
        # A successfull scenario, when everyting is correct
        response = self.client.post('/upload_file/', data={
            'file': (io.BytesIO(b'col1,col2,col3\n1,2,3'), 'input.csv')
        }, content_type='multipart/form-data')
        self.assert200(response)

    def test_empty_file_upload(self):
        # Scenario, when the uploading file is empty
        response = self.client.post('/upload_file/', data={
            'file': (io.BytesIO(b''), 'input.csv')
        }, content_type='multipart/form-data')
        self.assertEquals(response.json, dict(
            success=False,
            error='The file is empty.'
        ))
        self.assert200(response)

    def test_wrong_file_type(self):
        # Scenario, when the uploading file has a wrong format
        response = self.client.post('/upload_file/', data={
            'file': (io.BytesIO(b'123'), 'image.png')
        }, content_type='multipart/form-data')
        self.assertEquals(response.json, dict(
            success=False,
            error='Wrong file type.'
        ))
        self.assert200(response)

    def test_no_file(self):
        # Scenario, when the is sent request without a file
        response = self.client.post('/upload_file/')
        self.assertEquals(response.json, dict(
            success=False,
            error='You did not select any file.'
        ))
        self.assert200(response)

    def test_unknown_delimiter(self):
        response = self.client.post('/upload_file/', data={
            'file': (io.BytesIO(b'col1$col2$col3\n1$2$3'), 'input.csv')
        }, content_type='multipart/form-data')
        self.assert200(response)
