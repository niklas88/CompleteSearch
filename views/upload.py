from flask import request, jsonify
from app import app

import os
import csv
import io
import pandas as pd
import json


@app.route('/upload_file/', methods=['POST'])
def upload_file():
    """ Check the uploaded file, process and feed it to CompleteSearch """
    error = ''

    try:
        if 'file' in request.files:
            file = request.files['file']
            if file and allowed_file(file.filename):
                if file.filename.split('.')[1] == 'xml':
                    # TODO: process xml
                    pass

                else:
                    file_str = file.read().decode('utf-8')
                    file_obj = io.StringIO(file_str)
                    dialect = csv.Sniffer().sniff(file_str, delimiters='\t,')
                    path = os.path.join(app.config['BASE_DIR'], 'data')

                    process_csv(file_obj, dialect.delimiter, path)
            else:
                error = 'Wrong file type.'
        else:
            error = 'You did not select any file.'

    except Exception as e:
        error = str(e)
        app.logger.exception(error)

    return jsonify(
        success=not error,
        error=error
    )


def allowed_file(filename):
    """ Check if uploading file's type is allowed """
    return '.' in filename and \
        filename.rsplit('.', 1)[1] in app.config['ALLOWED_EXTENSIONS']


def process_csv(file, delimiter, path):
    """ Check the uploaded file (skip bad rows) and process it """
    data = pd.read_csv(file, delimiter=delimiter, error_bad_lines=False)

    # Define facets
    facets = []
    num_records = data.shape[0]

    for column in data:
        counts = data[column].value_counts()
        if counts.size < num_records:
            items = sorted(
                [
                    {
                        'name': name,
                        'count': int(count)
                    }
                    for name, count in dict(counts[counts > 1]).items()
                ],
                key=lambda x: (x['count'], x['name']), reverse=True
            )

            if items:
                facets.append({'name': column, 'items': items})

    # Write facets to the file
    with open(os.path.join(path, 'facets.json'), 'w') as f:
        f.write(json.dumps(
            {'facets': sorted(facets, key=lambda x: x['name'])}
        ))

    # Write the input file and send it to CompleteSearch
    data.to_csv(
        os.path.join(path, 'input.csv'),
        sep='\t',
        encoding='utf-8',
        escapechar='\\',  # test this
        index=False
    )

    # TODO: send to CompleteSearch
