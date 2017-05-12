import subprocess
import json

from flask import Blueprint, request, current_app as app, jsonify

bp = Blueprint('settings', __name__)


@bp.route('/get_settings/', methods=['GET'])
def get_settings():
    """ Get a dictionary with all dataset settings. """
    settings = app.settings.to_dict()

    data = {
        'title_field': settings['title_field'],
        'within_field_separator': settings['within_field_separator'],
        'all_fields': settings['all_fields'],
        'allow_multiple_items': settings['allow_multiple_items'],
        'facets': settings['facets'],
        'filter': settings['filter'],
        'full_text': settings['full_text'],
        'show': settings['show'],
    }

    return jsonify(data)


@bp.route('/configure_dataset/', methods=['POST'])
def configure_dataset():
    """  """
    settings = app.settings.to_dict()
    error = ''

    try:
        if not request.data:
            raise ValueError('Data is missing.')

        params = json.loads(str(request.data, 'utf-8'))

        if not params['full_text'] and not params['show']:
            raise ValueError('At least one field must be selected in both ' +
                             'Full Text and Show')

        settings.update(params)
        settings['within_field_separator'] = params['within_field_separator'] \
            if params['within_field_separator'] != '' else ';'
        app.settings.save()

        # Don't run this code with TestingConfig
        if not app.config['TESTING']:
            full_text = ','.join(settings['full_text'])
            allow_multiple_items = ','.join(settings['allow_multiple_items'])
            show = ','.join(settings['show'])
            filter_ = ','.join(settings['filter'])
            facets = ','.join(settings['facets'])

            opts = "--within-field-separator=';' " + \
                   '--full-text=%s ' % full_text + \
                   '--allow-multiple-items=%s ' % allow_multiple_items + \
                   '--show=%s ' % show + \
                   '--filter=%s ' % filter_ + \
                   '--facets=%s' % facets

            command = 'make OPTIONS="%s" pclean-all process_input start' % opts

            # Process the input
            out, err = subprocess.Popen(
                [command],
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            ).communicate()
            app.logger.debug('[Process input]: command error:\n%s' %
                             str(err, 'utf-8'))

    except ValueError as e:
        error = str(e)
        app.logger.exception(e)

    return jsonify(success=not error, error=error)


@bp.route('/delete_dataset/', methods=['POST'])
def delete_dataset():
    """ Delete the uploaded dataset. """
    subprocess.Popen(['make stop pclean-all'], shell=True).communicate()
    app.settings.reset()
    return jsonify(success=True)
