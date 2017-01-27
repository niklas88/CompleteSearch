from flask import Blueprint, render_template, current_app as app, jsonify

bp = Blueprint('common', __name__)


@bp.route('/')
def index():
    """ Show index page. """
    settings = app.settings.to_dict()
    view = 'search' if settings['database_uploaded'] else 'index'

    return render_template(
        'index.html',
        VIEW=view,
        DEBUG=app.config['DEBUG']
    )


@bp.route('/get_facets/', methods=['GET'])
def get_facets():
    """ Return all facets. """
    # settings = app.settings.to_dict()
    # facets = settings['facets']
    # return jsonify(facets)
    return jsonify([])
