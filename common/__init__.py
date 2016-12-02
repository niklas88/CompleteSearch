from flask import Blueprint, render_template, current_app as app, jsonify

import os
import json

bp = Blueprint('common', __name__)


@bp.route('/')
def index():
    """ Show index page. """
    settings = os.path.join(app.config['BASE_DIR'], 'data/settings.json')
    input_csv = os.path.join(app.config['BASE_DIR'], 'data/input.csv')
    input_xml = os.path.join(app.config['BASE_DIR'], 'data/input.xml')
    view = 'index'

    is_uploaded = os.path.isfile(input_csv) or os.path.isfile(input_xml)
    is_configured = os.path.isfile(settings)

    # If database is uploaded, show Configure view
    if is_uploaded:
        view = 'configure'

    # If database is configured, show Search view
    if is_configured:
        view = 'search'

    return render_template(
        'index.html',
        VIEW=view,
        DEBUG=app.config['DEBUG']
    )


@bp.route('/get_facets/', methods=['GET'])
def get_facets():
    """ Return all facets. """
    facets_file = os.path.join(app.config['BASE_DIR'], 'data/facets.json')
    with open(facets_file, 'r') as f:
        facets = json.loads(f.read())['facets']
    return jsonify(facets)
