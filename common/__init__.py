from flask import Blueprint, render_template, current_app as app, jsonify

import os
import json

bp = Blueprint('common', __name__)


@bp.route('/')
def index():
    """ Show index page. """

    # If facets file exists, show Search View. Otherwise, show Upload View
    facets_file = os.path.join(app.config['BASE_DIR'], 'data/facets.json')
    uploaded = os.path.isfile(facets_file)

    return render_template(
        'index.html',
        DATABASE_UPLOADED=uploaded,
        DEBUG=app.config['DEBUG']
    )


@bp.route('/get_facets/', methods=['GET'])
def get_facets():
    """ Return all facets. """
    facets_file = os.path.join(app.config['BASE_DIR'], 'data/facets.json')
    with open(facets_file, 'r') as f:
        facets = json.loads(f.read())['facets']
    return jsonify(facets)
