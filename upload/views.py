import csv
import pandas as pd
import subprocess
import json
import io
import re

from flask import Blueprint, request, current_app as app, jsonify

bp = Blueprint('upload', __name__)


@bp.route('/upload_file/', methods=['POST'])
def upload_file():
    """
    POST /upload_file/
        Upload, validate and process a file, and send it to CompleteSearch.

    :param use_first_row: use the first data row as a header.
        If the parameter is ``False``, the column names will be generated
        automatically (i.e. Column1, Column2, etc.).

    :param file: the uploading file

    :returns: dictionary with dataset settings, e.g. facet/filter fields,
        which fields to use for the full-text search, etc.

    :rtype: JSON response
    """
    num_cols = 40
    dialect = None
    result = {}
    error = ''

    header_row = True if request.form.get('use_first_row', 'true') == 'true' \
        else False

    def create_header(cols):
        return ['Column' + str(i + 1) for i in range(cols)] \
            if not header_row else None

    def create_dataframe(file, delimiter, names):
        return pd.read_csv(
            file,
            delimiter=delimiter,
            encoding='utf-8',
            engine='c',
            comment='#',
            error_bad_lines=False,
            dtype=object,
            names=names,
        )

    try:
        if 'file' not in request.files:
            raise ValueError('You did not select any file.')

        csv_file = request.files['file']
        if not allowed_file(csv_file.filename):
            raise ValueError('Wrong file type.')

        # Select non-empty lines to define a delimiter
        lines = []
        for line in csv_file:
            line = str(line, 'utf-8').strip()
            if not line.startswith('#') and line != '':
                lines.append(line)
            if len(lines) == 50:
                break
        csv_file.seek(0)

        if not any(lines):
            raise ValueError('Cannot define a delimiter.')

        # Define the delimiter
        dialect = csv.Sniffer().sniff('\n'.join(lines), delimiters=',;#$|\t')

        # Create a list with column names
        header = create_header(num_cols)

        csv_file_string = str(csv_file.read(), 'utf-8')
        data = create_dataframe(io.StringIO(csv_file_string),
                                dialect.delimiter, header)

        # Extend the number of columns and re-create the DataFrame
        if list(data.isnull().all()).count(True) == 0:
            num_cols += 20
            header = create_header(num_cols)
            # data = create_dataframe(new_file, dialect.delimiter, header)
            data = create_dataframe(io.StringIO(csv_file_string),
                                    dialect.delimiter, header)

        # Remove extra columns with all empty rows
        data = data.dropna(axis=1, how='all')

        if data.empty:
            raise ValueError('Cannot process the uploaded file. '
                             'Please make sure the header row contains data '
                             'in all columns (fields) if you selected to use '
                             'the first row as the header.')
        if header_row:
            # Remove all spaces in the columns
            header = {c: re.sub(r'\s+', '', c) for c in data.columns}
            data = data.rename(columns=header)

            for field in header:
                if field == '' or field.lower().startswith('xml') \
                        or not field[0].isalpha():
                    raise ValueError('Cannot process the uploaded file. '
                                     'Please make sure each column (field) '
                                     'in the header row starts with a letter '
                                     'and doesn\'t start with "xml".')

        # data, facets_fields = process_csv(csv_file, dialect.delimiter)
        facets_fields = define_facets(data)
        # facets_fields = sorted(facets_fields)
        facets_fields_str = ','.join(facets_fields)
        all_fields = data.columns.values.tolist()
        all_fields_str = ','.join(all_fields)

        result = {
            'database_uploaded': True,
            'all_fields': all_fields,
            'full_text': all_fields,
            'show': facets_fields,
            'facets': facets_fields,
            'filter': facets_fields,
        }

        # Save the processed file
        data.to_csv(
            app.config['OUTPUT_PATH'],
            sep='\t',
            escapechar='\\',  # test this
            index=False
        )

        # Don't run this code with TestingConfig
        if not app.config['TESTING']:  # pragma: no cover
            opts = '--within-field-separator=\\; ' + \
                   '--full-text=%s ' % all_fields_str + \
                   '--show=%s ' % facets_fields_str + \
                   '--filter=%s ' % facets_fields_str + \
                   '--facets=%s' % facets_fields_str

            command = 'make OPTIONS="%s" pclean-all process_input' % opts

            # Process the input
            out, err = subprocess.Popen([command], shell=True,
                                        stdout=subprocess.PIPE,
                                        stderr=subprocess.PIPE, ).communicate()

            cmd_error = str(err, 'utf-8')
            if '[process_input] Error' in cmd_error:
                app.logger.debug('[Process input]:\n%s' % cmd_error)
                errors = set()
                for err_line in cmd_error.split('\n'):
                    if err_line != '' and not err_line.startswith('make') \
                            and not err_line.startswith('sort'):
                        errors.add(err_line)
                error = '<br/>'.join(list(errors))

    except Exception as e:
        error = str(e)
        app.logger.exception(e)

    return jsonify(success=not error, error=error, data=result)


@bp.route('/save_uploaded_dataset/', methods=['POST'])
def save_uploaded_dataset():
    """
    POST /save_uploaded_dataset/
        Save the ploaded dataset's settings and start the CompleteSearch server

    :param data: a dictionary with all dataset's settings, which have been
        generated by the ``upload_file`` function.

    :returns: dictionary with the ``success`` property and an ``error`` message

    :rtype: JSON response
    """
    settings = app.settings.to_dict()
    error = ''

    try:
        if not request.data:
            raise ValueError('Data is missing.')
        params = json.loads(str(request.data, 'utf-8'))

        # Save the settings
        settings.update(params)
        app.settings.save()

        # Start the server
        subprocess.Popen(['make start'], shell=True).communicate()

    except Exception as e:
        error = str(e)
        app.logger.exception(e)

    return jsonify(success=not error, error=error)


def allowed_file(filename):
    """
    Check if the uploading file's type is allowed.

    :param filename: filename

    :returns: result of the check

    :rtype: bool
    """
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


def define_facets(data):
    """
    Define facets by their occurrence in the dataset.

    :param data: ``DataFrame`` with the uploaded dataset

    :returns: field names which will be used as facets

    :rtype: list
    """
    non_nan_rows = data.count()  # number of non-NaN rows in each column

    # Define good facets (columns which have more than one occurrence)
    facets = [
        {
            'name': column,
            'count': data[column].value_counts().size
        }
        for column in data
        if data[column].value_counts().size < non_nan_rows[column]
    ]
    facets = [x['name'] for x in sorted(facets, key=lambda x: x['count'])[:5]]

    return facets


# def process_csv(csv_file, delimiter):
#     """ Check the uploaded file (skip bad rows) and define facets. """
#     data = pd.read_csv(
#         csv_file,
#         delimiter=delimiter,
#         encoding='utf-8',
#         engine='c',
#         comment='#',
#         error_bad_lines=False,
#         dtype=object,
#     )

#     # Number of non-NaN rows in each column
#     non_nan_rows = data.count()

#     # Define good facets (columns which have more than one occurrence)
#     facets = [
#         {
#             'name': column,
#             'count': data[column].value_counts().size
#         }
#         for column in data
#         if data[column].value_counts().size < non_nan_rows[column]
#     ]
#     facets = [x['name'] for x in sorted(facets, key=lambda x: x['count'])[:5]]

#     return data, facets
