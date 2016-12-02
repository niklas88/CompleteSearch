from flask import Blueprint, request, current_app as app, jsonify

from urllib.request import urlopen
from urllib.error import URLError
import json

bp = Blueprint('search', __name__)


@bp.route('/search/', methods=['GET'])
def search():
    """ Perform a search using CompleteSearch. """
    error = ''
    data = []
    query = request.args.get('query')

    settings = app.config['SETTINGS']
    ip = app.config['DOCKER_MACHINE_IP']
    port = app.config['DOCKER_MACHINE_PORT']

    url = 'http://%s:%s/?q=%s&format=json' % (ip, port, query)

    try:
        response = urlopen(url)
        content = response.read().decode('utf-8').replace('\r\n', '')
        result = json.loads(content)['result']
        hits = result['hits']

        if int(hits['@total']) > 0:
            for hit in result['hits']['hit']:
                items = [
                    {
                        'name': field,
                        'value': hit['info'][field]
                    }
                    for field in settings['--show']
                ]

                hit_data = {
                    'titleField': settings['--title-field'][0],
                    'items': items
                }

                data.append(hit_data)

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
        if e.__class__ == URLError:
            error = 'CompleteSearch server is not running or responding.'
        else:
            error = str(e)
        app.logger.exception(e)

    return jsonify({
        'success': not error,
        'error': error,
        'data': data
    })
