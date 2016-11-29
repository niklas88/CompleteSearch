from flask import Blueprint, request, current_app as app, jsonify

import os
import csv
import io
import pandas as pd
import json

bp = Blueprint('upload', __name__)


@bp.route('/upload_file/', methods=['POST'])
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

    facets = sorted(facets, key=lambda x: x['name'])

    # Write facets to the file
    with open(os.path.join(path, 'facets.json'), 'w') as f:
        f.write(json.dumps(
            {'facets': facets}
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


@bp.route('/get_fields/', methods=['GET'])
def get_fields():
    """ Get fields for database configuration. """
    error = ''
    data = []

    try:
        # TODO: get fields from a json file
        fields = ['Titel', 'Autor', 'Jahr', 'Preis']
        data = [{'name': field} for field in fields]

    except Exception as e:
        error = str(e)
        app.logger.exception(error)

    return jsonify(data)


@bp.route('/configure_database/', methods=['POST'])
def configure_database():
    """  """
    error = ''
    params = json.loads(request.data.decode('utf-8'))

    full_text = params['--full-text']
    show = params['--show']
    facets = params['--facets']
    filters = params['--filter']
    multiple_items = params['--allow-multiple-items']
    title_field = params['--title-field'][0]
    within_field_separator = params['--within-field-separator'][0]

    # TODO: checks

    # Construct a command for genereating CompleteSearch input files
    DB = 'input/input'
    PARSER_OPTIONS = '--base-name=input/input ' + \
                     '--write-docs-file ' + \
                     '--write-words-file-ascii ' + \
                     '--show=' + ','.join(show) + ' ' + \
                     '--normalize-words ' + \
                     '--encoding=utf8 ' + \
                     '--maps-directory=parser/'

    if any(multiple_items) and within_field_separator != '':
        PARSER_OPTIONS += ' --allow-multiple-items=' + ','.join(multiple_items)
        PARSER_OPTIONS += ' --within-field-separator=' + within_field_separator

    if any(full_text):
        PARSER_OPTIONS += ' --full-text=' + ','.join(full_text)

    if any(facets):
        PARSER_OPTIONS += ' --facets=' + ','.join(facets)

    if any(filters):
        PARSER_OPTIONS += ' --filter=' + ','.join(filters)

    command = 'make pall DB="%s" PARSER_OPTIONS="%s"' % (DB, PARSER_OPTIONS)

    # with open(os.path.join(path, 'make_command.txt'), 'w') as f:
    #     f.write(command)

    # TODO: send the command to CompleteSearch and generate files

    return jsonify(
        success=not error,
        error=error
    )
