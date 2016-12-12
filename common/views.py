from flask import Blueprint, render_template, current_app as app, jsonify
from .utils import db_is_uploaded, db_is_configured

import os
import json

bp = Blueprint('common', __name__)


@bp.route('/')
def index():
    """ Show index page. """
    view = 'index'

    if db_is_configured(app):
        # If database is configured, show Search view
        view = 'search'
    elif db_is_uploaded(app):
        # If database is uploaded, show Configure view
        view = 'configure'
    else:
        # Default Index view
        view = 'index'

    return render_template(
        'index.html',
        VIEW=view,
        DEBUG=app.config['DEBUG']
    )


@bp.route('/get_facets/', methods=['GET'])
def get_facets():
    """ Return all facets. """
    if os.path.isfile(app.config['FACETS_PATH']):
        with open(app.config['FACETS_PATH'], 'r') as f:
            facets = json.loads(f.read())['facets']
    else:
        facets = []
    return jsonify(facets)
