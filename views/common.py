from flask import render_template, jsonify
from app import app


@app.route('/')
def index():
    # TODO: check if database exists. If not, show the upload form
    view = 'upload'  # Temporary
    return render_template('index.html', view=view)


@app.route('/get_categories/', methods=['GET'])
def get_categories():
    # Temporary
    categories = [
        {
            'title': 'Author',
            'content': 'content'
        },
        {
            'title': 'Title',
            'content': 'content'
        },
        {
            'title': 'Year',
            'content': 'content'
        }
    ]

    return jsonify(categories)
