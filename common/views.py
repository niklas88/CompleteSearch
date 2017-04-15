from flask import Blueprint, render_template, current_app as app

bp = Blueprint('common', __name__)


@bp.route('/')
def index():
    """ Show index page. """
    settings = app.settings.to_dict()
    view = 'search' if settings['database_uploaded'] else 'index'

    return render_template(
        'index.html',
        DATABASE_UPLOADED=settings['database_uploaded'],
        VIEW=view,
        DEBUG=app.config['DEBUG']
    )
