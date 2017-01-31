from flask import Blueprint, request, current_app as app, jsonify

import os
import csv
import pandas as pd
# import json
import subprocess

bp = Blueprint('upload', __name__)


@bp.route('/upload_file/', methods=['POST'])
def upload_file():
    """
    Upload a file, validate and process it, and "feed" it to CompleteSearch.
    """
    settings = app.settings.to_dict()
    dialect = None
    error = ''

    if 'file' in request.files:
        csv_file = request.files['file']
        if csv_file and allowed_file(csv_file.filename):
            # Read first three lines
            temp_lines = ''
            for _ in range(3):
                temp_lines += str(csv_file.readline(), 'utf-8') + '\n'
            csv_file.seek(0)

            if temp_lines != '\n\n\n':
                try:
                    # Define the delimiter
                    dialect = csv.Sniffer().sniff(
                        temp_lines,
                        delimiters=',;#$|\t',
                    )
                except csv.Error as e:
                    error = 'Unknown delimiter.'
                    app.logger.exception(e)
            else:
                error = 'The file is empty.'

            if dialect and not error:
                data, facets_fields = process_csv(csv_file, dialect.delimiter)
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

                # Save the processed file
                data.to_csv(
                    app.config['OUTPUT_PATH'],
                    sep='\t',
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
        else:
            error = 'Wrong file type.'
    else:
        error = 'You did not select any file.'

    return jsonify(
        success=not error,
        error=error
    )


def allowed_file(filename):
    """ Check if uploading file's type is allowed. """
    return '.' in filename and \
        filename.rsplit('.', 1)[1] in app.config['ALLOWED_EXTENSIONS']


def process_csv(csv_file, delimiter):
    """ Check the uploaded file (skip bad rows) and define facets. """
    data = pd.read_csv(
        csv_file,
        delimiter=delimiter,
        error_bad_lines=False,
        dtype=object,
    )

    # Number of non-NaN rows in each column
    non_nan_rows = data.count()

    # Define good facets (columns which have more than one occurrence)
    facets = [
        column
        for column in data
        if data[column].value_counts().size < non_nan_rows[column]
    ]

    return data, facets


# @bp.route('/get_fields/', methods=['GET'])
# def get_fields():
#     """ Get fields for database configuration. """
#     error = ''
#     data = []
#
#     try:
#         # TODO: get fields from a json file
#         fields = ['Titel', 'Autor', 'Jahr', 'Preis']
#         data = [{'name': field} for field in fields]
#
#     except Exception as e:
#         error = str(e)
#         app.logger.exception(error)
#
#     return jsonify(data)


# @bp.route('/configure_database/', methods=['POST'])
# def configure_database():
#     """  """
#     error = ''
#     params = json.loads(request.data.decode('utf-8'))
#     separator = params['--within-field-separator'][0]
#     settings = {}
#
#     # Construct a command for genereating CompleteSearch input files
#     DB = 'input/input'
#     PARSER_OPTIONS = '--base-name=input/input ' + \
#                      '--write-docs-file ' + \
#                      '--write-words-file-ascii ' + \
#                      '--normalize-words ' + \
#                      '--encoding=utf8 ' + \
#                      '--maps-directory=parser/'
#
#     for p_name, p_value in params.items():
#         settings[p_name] = p_value
#         if p_name == '--title-field':
#             pass
#         elif p_name == '--allow-multiple-items':
#             PARSER_OPTIONS += ' %s=%s' % (p_name, ','.join(p_value))
#             sep = separator if separator != '' else ';'
#             PARSER_OPTIONS += ' --within-field-separator="%s"' % sep
#         else:
#             if any(p_value):
#                 PARSER_OPTIONS += ' %s=%s' % (p_name, ','.join(p_value))
#
#     comm = 'make pall DB="%s" PARSER_OPTIONS=\'%s\' && ' % (DB, PARSER_OPTIONS)
#     comm += 'cp input/{input.hybrid,input.vocabulary,input.docs.DB} server'
#
#     path = os.path.join(app.config['BASE_DIR'], 'data')
#     with open(os.path.join(path, 'make_command.txt'), 'w') as f:
#         f.write(comm)
#
#     # Save DB settings
#     app.config['SETTINGS'] = settings
#     with open(os.path.join(path, 'settings.json'), 'w') as f:
#         f.write(json.dumps(settings))
#
#     # TODO: send the command to CompleteSearch and generate files
#
#     return jsonify(
#         success=not error,
#         error=error
#     )
