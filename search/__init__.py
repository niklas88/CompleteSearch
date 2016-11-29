from flask import Blueprint, request, current_app as app, jsonify

import urllib
import json

bp = Blueprint('search', __name__)


@bp.route('/search/', methods=['GET'])
def search():
    """  """
    error = ''
    data = []
    url = 'http://192.168.99.100:8888/?q=%s&format=json'

    query = request.args.get('query')

    try:
        response = urllib.request.urlopen(url % query)
        content = response.read().decode('utf-8').replace('\r\n', '')
        result = json.loads(content)['result']
        hits = result['hits']

        if int(hits['@total']) > 0:
            for hit in result['hits']['hit']:
                # Front-end hit fields must by dynamic
                data.append({
                    'title': hit['info']['Titel'],
                    'description': '...'
                })

        # XML response
        # root = ET.fromstring(content)
        # hits = root.find('hits')
        #
        # for hit in hits.iter('hit'):
        #     info = hit.find('info').text
        #     # excerpt = hit.find('excerpt').text
        #     data.append({
        #        'title': ET.fromstring(info).text,
        #        'description': '...'
        #     })

    except Exception as e:
        error = str(e)
        app.logger.exception(error)

    return jsonify({
        'success': not error,
        'error': error,
        'data': data
    })
