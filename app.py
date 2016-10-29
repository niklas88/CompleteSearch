from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename

import os

DEBUG = True
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
ALLOWED_EXTENSIONS = set(['txt', 'xml', 'csv', 'tsv'])

app = Flask(__name__)


@app.route('/')
def index():
    # TODO: check if database exists. If not, show the upload form
    view = 'upload'  # Temporary
    return render_template('index.html', view=view)


@app.route('/get_categories/', methods=['GET'])
def get_categories():
    # Temporary
    categories = [
        {
            'title': 'Author',
            'content': 'content'
        },
        {
            'title': 'Title',
            'content': 'content'
        },
        {
            'title': 'Year',
            'content': 'content'
        }
    ]

    return jsonify(categories)


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS


@app.route('/upload_file/', methods=['POST'])
def upload_file():
    error = ''

    try:
        if 'file' in request.files:
            file = request.files['file']

            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            else:
                error = 'Wrong file type.'

        else:
            error = 'You did not select any file.'

    except Exception as e:
        error = str(e)

    return jsonify(
        success=not error,
        error=error,
    )


if __name__ == '__main__':
    app.debug = DEBUG
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    app.run()
