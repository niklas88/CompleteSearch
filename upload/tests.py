import os
import io

from app import create_app
from flask_testing import TestCase


# TODO@me: consider all possible kinds of invalid input data
class UploadFileTest(TestCase):
    def create_app(self):
        self.app = create_app('TestingConfig')
        return self.app

    def test_file_upload(self):
        input_path = os.path.join(
            self.app.config['BASE_DIR'], 'test_data', 'input1.csv',
        )

        with open(input_path, 'rb') as input_file:
            response = self.client.post('/upload_file/', data={
                'file': (io.BytesIO(input_file.read()), 'input.csv')
            }, content_type='multipart/form-data')
            self.assert200(response)
            self.assertEquals(response.json, {
                'success': True,
                'error': '',
            })

            output_path = os.path.join(
                self.app.config['BASE_DIR'], 'test_data', 'output1.csv',
            )

            result_path = os.path.join(
                self.app.config['BASE_DIR'], 'test_data', 'test_result.csv',
            )

            with open(output_path, 'r') as out, open(result_path, 'r') as res:
                self.assertEquals(out.read(), res.read())
                os.remove(result_path)

    def test_no_file(self):
        response = self.client.post('/upload_file/')
        self.assert200(response)
        self.assertEquals(response.json, {
            'success': False,
            'error': 'You did not select any file.',
        })

    def test_empty_file(self):
        response = self.client.post('/upload_file/', data={
            'file': (io.BytesIO(b''), 'input.csv')
        }, content_type='multipart/form-data')
        self.assert200(response)
        self.assertEquals(response.json, {
            'success': False,
            'error': 'The file is empty.',
        })

    def test_wrong_file_type(self):
        response = self.client.post('/upload_file/', data={
            'file': (io.BytesIO(b'123'), 'image.png')
        }, content_type='multipart/form-data')
        self.assert200(response)
        self.assertEquals(response.json, {
            'success': False,
            'error': 'Wrong file type.',
        })

    def test_unknown_delimiter(self):
        response = self.client.post('/upload_file/', data={
            'file': (io.BytesIO(b'col1~col2~col3\n1~2~3'), 'input.csv')
        }, content_type='multipart/form-data')
        self.assert200(response)
        self.assertEquals(response.json, {
            'success': False,
            'error': 'Could not determine delimiter',
        })
