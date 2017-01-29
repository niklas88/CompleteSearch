from flask import Blueprint, request, current_app as app, jsonify

import os
import csv
import io
import pandas as pd
import json
import subprocess

bp = Blueprint('upload', __name__)


@bp.route('/upload_file/', methods=['POST'])
def upload_file():
    """
    Upload a file, validate and process it, and "feed" it to CompleteSearch.
    """
    settings = app.settings.to_dict()
    error = ''

    if 'file' in request.files:
        file = request.files['file']
        if file and allowed_file(file.filename):
            file_str = str(file.read(), encoding='utf8')
            file_obj = io.StringIO(file_str)
            if file_str != '':
                try:
                    # TODO: define all possible delimiters
                    dialect = csv.Sniffer().sniff(
                        file_str,
                        delimiters=',;\t'
                    )
                    data, facets = process_csv(file_obj, dialect.delimiter)
                    facets_fields = [f['name'] for f in facets]
                    facets_fields_str = ','.join(facets_fields)
                    all_fields = data.columns.values.tolist()
                    all_fields_str = ','.join(all_fields)

                    # Update settings
                    settings['database_uploaded'] = True
                    settings['all_fields'] = all_fields
                    settings['facets'] = facets_fields
                    settings['full_text'] = all_fields
                    settings['show'] = facets_fields
                    settings['filter'] = facets_fields
                    app.settings.save()

                    # Save the uploaded file
                    data.to_csv(
                        os.path.join('../data', 'input.csv'),
                        sep='\t',
                        encoding='utf-8',
                        escapechar='\\',  # test this
                        index=False
                    )

                    # TODO@me: define allow-multiple-items automatically
                    opts = "--within-field-separator=';' " + \
                           '--full-text=%s ' % all_fields_str + \
                           '--allow-multiple-items=Autor ' + \
                           '--show=%s ' % facets_fields_str + \
                           '--filter=%s ' % facets_fields_str + \
                           '--facets=%s' % facets_fields_str

                    command = 'make OPTIONS="%s" prepare_input' % opts

                    # Generate necessary files
                    os.chdir('../completesearch')
                    output1, err1 = subprocess.Popen(
                        [command],
                        shell=True,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                    ).communicate()
                    app.logger.debug('Prepare input:\n%s' % err1)

                    # Stop CompleteSearch server
                    output2, err2 = subprocess.Popen(
                        ['make stop_server'],
                        shell=True,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                    ).communicate()
                    app.logger.debug('Stop CS server:\n%s' % output2)

                    # Start CompleteSearch server
                    output3, err3 = subprocess.Popen(
                        ['make start_server'],
                        shell=True,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                    ).communicate()
                    app.logger.debug('Start CS server:\n%s' % output3)

                except Exception as e:
                    app.logger.exception(e)
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


def process_csv(file, delimiter):
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

    return data, facets


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

    comm = 'make pall DB="%s" PARSER_OPTIONS=\'%s\' && ' % (DB, PARSER_OPTIONS)
    comm += 'cp input/{input.hybrid,input.vocabulary,input.docs.DB} server'

    path = os.path.join(app.config['BASE_DIR'], 'data')
    with open(os.path.join(path, 'make_command.txt'), 'w') as f:
        f.write(comm)

    # Save DB settings
    app.config['SETTINGS'] = settings
    with open(os.path.join(path, 'settings.json'), 'w') as f:
        f.write(json.dumps(settings))

    # TODO: send the command to CompleteSearch and generate files

    return jsonify(
        success=not error,
        error=error
    )
