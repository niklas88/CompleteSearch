from flask import jsonify
from app import app

import json


@app.route('/get_configs/', methods=['GET'])
def get_configs():
    """  """
    error = ''
    data = []

    fields = ['Option One', 'Option Two', 'Option Three', 'Option Four']

    try:
        data = [
            {
                'type': 'select',
                'name': '--title-field',
                'label': 'Title Field',
                'tooltip': 'Title Field',
                'fields': ['--'] + fields
            },
            {
                'type': 'checkbox',
                'name': '--show',
                'label': 'Search by',
                'tooltip': 'Search by',
                'fields': fields
            },
            {
                'type': 'checkbox',
                'name': '--allow-multiple-items',
                'label': 'Multiple Items Fields',
                'tooltip': 'Multiple Items Fields',
                'fields': fields
            },
            {
                'type': 'textfield',
                'name': '--within-field-separator',
                'label': 'Multiple Items Fields Separator',
                'tooltip': 'Multiple Items Fields Separator',
                'fields': []
            },
            {
                'type': 'checkbox',
                'name': '--excerpts',
                'label': 'Excerpts',
                'tooltip': 'Excerpts',
                'fields': fields
            },
            {
                'type': 'checkbox',
                'name': '--facets',
                'label': 'Facets',
                'tooltip': 'Facets',
                'fields': fields
            }
        ]

    except Exception as e:
        error = str(e)
        app.logger.exception(error)

    return jsonify(data)
