from http.client import RemoteDisconnected
from urllib.request import urlopen
from urllib.error import URLError
import json
import re

from flask import Blueprint, request, current_app as app, jsonify

bp = Blueprint('search', __name__)


@bp.route('/get_facets_list/', methods=['GET'])
def get_facets_list():
    """ Return the list of facets. """
    settings = app.settings.to_dict()
    facets_list = [{'name': facet} for facet in settings['facets']]
    return jsonify(facets_list)


@bp.route('/get_facets/', methods=['GET'])
def get_facets():
    """ Return all facets for a given field name. """
    facets = []
    completions = None

    def facet_dict(item, facet_query):
        # Trim, remove :facet:<whatever>: and all html tags
        pattern = re.compile('<.*?>')
        name = item['text'].replace(facet_query, '').strip()
        name = re.sub(pattern, '', name)
        return {
            'name': name,
            'count': item['@oc'],
        }

    search_query = request.args.get('query', '').lower()
    facet_name = request.args.get('name', '')
    active_facets = json.loads(request.args.get('active', '{}'))

    if facet_name != '':
        facet_query = ':facet:%s:' % facet_name

        if search_query:
            search_query += '* '

        active_facet_items = ''
        for facet, items in active_facets.items():
            for item in items:
                active_facet_items += ':facet:%s:"%s" ' % (facet, item)

        combined_query = search_query + active_facet_items + facet_query
        combined_query = combined_query.replace(' ', '%20')

        url = 'http://0.0.0.0:8888/?q=%s*&format=json' % combined_query

        try:
            response = urlopen(url)
            content = str(response.read(), 'utf-8').replace('\r\n', '')
            result = json.loads(content)['result']
            completions = result['completions']
        except (URLError, RemoteDisconnected) as e:
            # error = 'CompleteSearch server is not running or responding.'
            app.logger.exception(e)
        else:
            # status = result['status']['@code']  # TODO@me: check the status
            if completions and int(completions['@total']) > 0:
                if int(completions['@total']) == 1:
                    facets = [facet_dict(completions['c'], facet_query)]
                else:
                    facets = [
                        facet_dict(c, facet_query)
                        for c in completions['c']
                    ]

    return jsonify(facets)


@bp.route('/search/', methods=['GET'])
def search():
    """ Perform search using CompleteSearch. """
    error = ''
    data = []
    settings = app.settings.to_dict()

    search_query = request.args.get('query', '').lower()
    active_facets = json.loads(request.args.get('active', '{}'))

    if search_query != '' or active_facets != {}:
        if search_query:
            search_query += '* '

        active_facet_items = ''
        for facet, items in active_facets.items():
            for item in items:
                active_facet_items += ':facet:%s:"%s" ' % (facet, item)

        combined_query = search_query + active_facet_items
        combined_query = combined_query.replace(' ', '%20')

        url = 'http://0.0.0.0:8888/?q=%s&format=json' % combined_query

        try:
            response = urlopen(url)
            content = str(response.read(), 'utf-8').replace('\r\n', '')
            result = json.loads(content)['result']
            hits = result['hits']
        except (URLError, RemoteDisconnected) as e:
            error = 'CompleteSearch server is not running or responding.'
            app.logger.exception(e)
        else:
            if int(hits['@total']) > 0:
                for hit in result['hits']['hit']:
                    fields = [
                        {
                            'name': field,
                            'value':
                                hit['info'][field]
                                if field in hit['info'].keys()
                                else ''
                        }
                        for field in settings['show']
                    ]

                    hit_data = {
                        'titleField': settings['title_field'],
                        'fields': fields
                    }

                    data.append(hit_data)
    else:
        error = 'No search query given.'

    return jsonify(success=not error, error=error, data=data)
