from flask import jsonify
from app import app

import json


@app.route('/get_fields/', methods=['GET'])
def get_configs():
    """  """
    error = ''
    data = []

    try:
        # TODO: get fields from a json file
        fields = ['Titel', 'Autor', 'Jahr', 'Preis']
        data = {'fields': fields}

    except Exception as e:
        error = str(e)
        app.logger.exception(error)

    return jsonify(data)
