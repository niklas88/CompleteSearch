import os
import subprocess
import json

from flask import Blueprint, request, current_app as app, jsonify

bp = Blueprint('settings', __name__)


@bp.route('/get_settings/', methods=['GET'])
def get_settings():
    """ Get a dictionary with all database settings. """
    settings = app.settings.to_dict()

    data = {
        'titleField': settings['title_field'],
        'withinFieldSeparator': settings['within_field_separator'],
        'allFields': settings['all_fields'],
        'allowMultipleItems': settings['allow_multiple_items'],
        'facets': settings['facets'],
        'filter': settings['filter'],
        'fullText': settings['full_text'],
        'show': settings['show'],
    }

    return jsonify(data)


@bp.route('/configure_database/', methods=['POST'])
def configure_database():
    """  """
    settings = app.settings.to_dict()
    error = ''

    if request.data:
        params = json.loads(str(request.data, 'utf-8'))
        if len(params['fullText']) != 0 and len(params['show']) != 0:
            separator = params['withinFieldSeparator']
            separator = separator if separator != '' else ';'
            settings['within_field_separator'] = separator
            settings['title_field'] = params['titleField']
            settings['full_text'] = params['fullText']
            settings['allow_multiple_items'] = params['allowMultipleItems']
            settings['show'] = params['show']
            settings['filter'] = params['filter']
            settings['facets'] = params['facets']

            # TODO@me: save settings only after making sure
            # files have been re-generated with CompleteSearch
            app.settings.save()
        else:
            error = 'At least one field must be selected in both ' + \
                    'Full Text and Show'
    else:
        error = 'Data is missing.'

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

    return jsonify(success=not error, error=error)


@bp.route('/delete_database/', methods=['POST'])
def delete_database():
    """ Delete the uploaded database. """
    os.chdir('../completesearch')
    subprocess.Popen(['make delete_input'], shell=True).communicate()
    app.settings.reset()
    return jsonify(success=True)
