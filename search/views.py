import re
import json

from http.client import RemoteDisconnected
from urllib.request import urlopen
from urllib.parse import quote
from urllib.error import URLError

from flask import Blueprint, request, current_app as app, jsonify

bp = Blueprint('search', __name__)


@bp.route('/get_facets_list/', methods=['GET'])
def get_facets_list():
    """ Return the list of facets. """
    settings = app.settings.to_dict()
    facets_list = [{'name': facet} for facet in sorted(settings['facets'])]
    return jsonify(facets_list)


@bp.route('/get_facets/', methods=['GET'])
def get_facets():
    """ Return all facets for a given field name. """
    data = []
    completions = None

    def facet_dict(item, facet_query):
        # Trim, remove :facet:<facet_name>: and all html tags
        pattern = re.compile('<.*?>')
        name = item['text'].replace(facet_query, '').strip()
        name = re.sub(pattern, '', name)
        splitted_name = name[:25].split(' ')
        short_name = ' '.join(splitted_name[:len(splitted_name)])
        return {
            'name': short_name + '...' if short_name != name else name,
            'title': name,
            'count': item['@oc'],
        }

    search_query = request.args.get('query', '').lower()
    facet_name = request.args.get('name', '')
    facets = request.args.get('facets', '')

    if facet_name != '':
        facet_query = ':facet:%s:' % facet_name

        if search_query:
            search_query = escape_user_input(search_query)
            search_query += ' '

        facet_items = ''
        for facet in facets.split():
            item = facet.split(':')
            facet_items += ':facet:%s:"%s" ' % (item[0], item[1])

        combined_query = quote(search_query + facet_items + facet_query)

        url = 'http://0.0.0.0:8888/?q=%s*&h=0&c=250&format=json' % \
            combined_query

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
                    data = [facet_dict(completions['c'], facet_query)]
                else:
                    data = [
                        facet_dict(c, facet_query)
                        for c in completions['c']
                    ]

    return jsonify(data)


@bp.route('/search/', methods=['GET'])
def search():
    """ Perform search using CompleteSearch. """
    error = ''
    data = []
    settings = app.settings.to_dict()

    search_query = request.args.get('query', '').lower()
    facets = request.args.get('facets', '')
    start = request.args.get('start', 0)
    hits_per_page = request.args.get('hits_per_page', 20)

    if search_query != '' or facets != '':
        if search_query:
            search_query = escape_user_input(search_query)

        facet_items = ''
        for facet in facets.split():
            item = facet.split(':')
            facet_items += ':facet:%s:"%s" ' % (item[0], item[1])

        if facet_items:
            search_query += ' '

        combined_query = quote(search_query + facet_items)
        url = 'http://0.0.0.0:8888/?q=%s&f=%s&h=%s&format=json' % (
            combined_query, start, hits_per_page)

        try:
            response = urlopen(url)
            content = str(response.read(), 'utf-8').replace('\r\n', '')
            result = json.loads(content)['result']
            hits = result['hits']
        except (URLError, RemoteDisconnected) as e:
            error = 'CompleteSearch server is not running or responding.'
            app.logger.exception(e)
        else:
            show_fields = sorted(settings['show'])
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
                        for field in show_fields
                    ]

                    hit_data = {
                        'titleField': settings['title_field'],
                        'fields': fields,
                        'total': int(hits['@total']),
                    }

                    data.append(hit_data)

    if error:
        raise app.ServerError(error)
    else:
        return jsonify(data)


def escape_user_input(query):
    """ Escape user input with double quotation marks,
    preserving search operators like |, $, and *.

    >>> escape_user_input(' vivaldi, antonio | mozart.bach    ')
    '"vivaldi, antonio"|"mozart"."bach"'

    >>> escape_user_input('mo* | bach$')
    '"mo"*|"bach"$'

    >>> escape_user_input('mozart')
    '"mozart"*'

    >>> escape_user_input('bach$')
    '"bach"$'
    """
    new_query = ''

    def escape_term(st, postfix):
        term = st.strip()
        if term[-1] == '*':
            escaped_term = '"%s"*' % term[:-1]
        elif term[-1] == '$':
            escaped_term = '"%s"$' % term[:-1]
        else:
            escaped_term = '"%s"' % term + postfix
        return escaped_term

    # Complex search
    if re.search('\.|\|', query):
        new_query = query
        for match in re.findall('[^.|]+', query):
            escaped_term = escape_term(match, '')
            new_query = new_query.replace(match, escaped_term)
    # Simple search
    else:
        new_query = escape_term(query, '*')

    return new_query
