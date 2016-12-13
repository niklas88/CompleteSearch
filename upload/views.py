from flask import Blueprint, request, current_app as app, jsonify

import os
import csv
import io
import pandas as pd
import json

bp = Blueprint('upload', __name__)


@bp.route('/upload_file/', methods=['POST'])
def upload_file():
    """
    Upload a file, validate and process it, and "feed" it to CompleteSearch.
    """
    error = ''

    if 'file' in request.files:
        file = request.files['file']
        if file and allowed_file(file.filename):
            file_str = str(file.read(), encoding='utf8')
            file_obj = io.StringIO(file_str)
            if file_str != '':
                try:
                    if file.filename.split('.')[1] == 'xml':
                        # TODO: process xml
                        pass

                    else:
                        # TODO: define all possible delimiters
                        dialect = csv.Sniffer().sniff(
                            file_str,
                            delimiters=',;\t'
                        )
                        path = os.path.join(app.config['BASE_DIR'], 'data')
                        process_csv(file_obj, dialect.delimiter, path)

                except Exception as e:
                    app.logger.exception(error)
                    error = str(e)
            else:
                error = 'The file is empty.'
        else:
            error = 'Wrong file type.'
    else:
        error = 'You did not select any file.'

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
    separator = params['--within-field-separator'][0]
    settings = {}

    # Construct a command for genereating CompleteSearch input files
    DB = 'input/input'
    PARSER_OPTIONS = '--base-name=input/input ' + \
                     '--write-docs-file ' + \
                     '--write-words-file-ascii ' + \
                     '--normalize-words ' + \
                     '--encoding=utf8 ' + \
                     '--maps-directory=parser/'

    for p_name, p_value in params.items():
        settings[p_name] = p_value
        if p_name == '--title-field':
            pass
        elif p_name == '--allow-multiple-items':
            PARSER_OPTIONS += ' %s=%s' % (p_name, ','.join(p_value))
            sep = separator if separator != '' else ';'
            PARSER_OPTIONS += ' --within-field-separator="%s"' % sep
        else:
            if any(p_value):
                PARSER_OPTIONS += ' %s=%s' % (p_name, ','.join(p_value))

    command = ''' make pall DB="%s" PARSER_OPTIONS=\'%s\' &&
                  cp input/{input.hybrid,input.vocabulary,input.docs.DB} server
              ''' % (DB, PARSER_OPTIONS)

    # command = 'make pall DB="%s" PARSER_OPTIONS=\'%s\' && ' + \
    #     'cp input/{input.hybrid,input.vocabulary,input.docs.DB} server' % \
    #     (DB, PARSER_OPTIONS)

    path = os.path.join(app.config['BASE_DIR'], 'data')
    with open(os.path.join(path, 'make_command.txt'), 'w') as f:
        f.write(command)

    # Save DB settings
    app.config['SETTINGS'] = settings
    with open(os.path.join(path, 'settings.json'), 'w') as f:
        f.write(json.dumps(settings))

    # TODO: send the command to CompleteSearch and generate files

    return jsonify(
        success=not error,
        error=error
    )
