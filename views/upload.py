from flask import request, jsonify
from werkzeug.utils import secure_filename
from app import app

import os


def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1] in app.config['ALLOWED_EXTENSIONS']


@app.route('/upload_file/', methods=['POST'])
def upload_file():
    error = ''

    try:
        if 'file' in request.files:
            file = request.files['file']

            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_DIR'], filename))
            else:
                error = 'Wrong file type.'

        else:
            error = 'You did not select any file.'

    except Exception as e:
        error = str(e)
        app.logger.exception(error)

    return jsonify(
        success=not error,
        error=error,
    )
