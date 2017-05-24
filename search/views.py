import re
# import json
import cgi

# from urllib.parse import quote
# from urllib.request import urlopen
# from urllib.error import URLError, HTTPError

from flask import Blueprint, request, current_app as app, jsonify
import requests

bp = Blueprint('search', __name__)


@bp.route('/get_facets_list/', methods=['GET'])
def get_facets_list():
    """
    GET /get_facets_list/
        Get the list of facet fields.

    :returns: list of all facet fields

    :rtype: JSON response
    """
    settings = app.settings.to_dict()
    facets_list = [{'name': facet} for facet in sorted(settings['facets'])]
    return jsonify(facets_list)


@bp.route('/get_facets/', methods=['GET'])
def get_facets():
    """
    GET /get_facets/?name={name}&q={query}
        Return all facets for a given field name and a search query.

    :param name: facet field name

    :param q: search query

    :returns: list of facet items for the given field

    :rtype: JSON response
    """
    error = ''
    data = []

    def facet_item_dict(item, facet_query):
        value = item['text']
        name = value.replace(facet_query[:-1], '')
        name = cgi.escape(name).replace('_', ' ') if value != '_' else value
        return {
            'name': name,
            'value': value,
            'count': item['@oc'],
        }

    query = request.args.get('q', '').strip()
    facet_name = request.args.get('name', '')

    try:
        if facet_name != '':
            facet_query = ':facet:%s:*' % facet_name

            query = process_user_input(query) + ' ' + facet_query if query \
                else facet_query

            # url = 'http://0.0.0.0:8888/?q=%s&h=0&c=250&format=json' % \
            #     quote(query)

            # response = urlopen(url)
            # content = str(response.read(), 'utf-8').replace('\r\n', '')
            # result = json.loads(content)['result']
            # completions = result['completions']

            response = requests.get('http://0.0.0.0:8888/', params={
                'q': query,
                'h': 0,
                'c': 250,
                'format': 'json',
            }, timeout=10)

            completions = response.json()['result']['completions']

            if completions and int(completions['@sent']) > 0:
                if int(completions['@sent']) == 1:
                    data = [facet_item_dict(completions['c'], facet_query)]
                else:
                    data = [
                        facet_item_dict(c, facet_query)
                        for c in completions['c']
                    ]

    except Exception as e:
        app.logger.exception(e)
        app.logger.error('SEARCH QUERY: "%s"' % query)
        # app.logger.error('SEARCH URL: "%s"' % url)
        # if e.__class__ == URLError:
        #     error = str(e.reason)
        # elif e.__class__ == HTTPError:
        #     error = str(e.reason)
        # else:
        #     error = str(e)
        if e.__class__ == requests.exceptions.ConnectionError:
            error = 'CompleteSearch server is not responding.'
        elif e.__class__ == requests.exceptions.ReadTimeout:
            error = 'Looks like the CompleteSearch server is taking too ' + \
                    'long to respond.'
        else:
            error = str(e)

    if error:
        raise app.ServerError(error)

    # Get rid of empty items
    # data = [x for x in data if x != {}]
    return jsonify(data)


@bp.route('/search/', methods=['GET'])
def search():
    """
    GET /search/?q={query}&start={start}&hits_per_page={hits_per_page}
        Perform search using CompleteSearch.

    :param q: search query

    :param start: send hits starting from this one

    :param hits_per_page: how many hits return per page

    :returns: list of search hits

    :rtype: JSON response
    """
    settings = app.settings.to_dict()
    error = ''
    data = []

    query = request.args.get('q', '').strip()
    start = request.args.get('start', 0)
    hits_per_page = request.args.get('hits_per_page', 20)

    try:
        if query != '':
            query = process_user_input(query)

            # url = 'http://0.0.0.0:8888/?q=%s&f=%s&h=%s&format=json' % (
            #     quote(query), start, hits_per_page)

            # response = urlopen(url)
            # content = str(response.read(), 'utf-8').replace('\r\n', '')
            # result = json.loads(content)['result']

            response = requests.get('http://0.0.0.0:8888/', params={
                'q': query,
                'f': start,
                'h': hits_per_page,
                'format': 'json',
            }, timeout=15)

            hits = response.json()['result']['hits']
            show_fields = sorted(settings['show'])

            if int(hits['@sent']) > 0:
                for hit in hits['hit']:
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

    except Exception as e:
        app.logger.exception(e)
        app.logger.error('SEARCH QUERY: "%s"' % query)
        # app.logger.error('SEARCH URL: "%s"' % url)
        # if e.__class__ == URLError:
        #     error = str(e.reason)
        # elif e.__class__ == HTTPError:
        #     error = str(e.reason)
        # else:
        #     error = str(e)
        if e.__class__ == requests.exceptions.ConnectionError:
            error = 'CompleteSearch server is not responding.'
        elif e.__class__ == requests.exceptions.ReadTimeout:
            error = 'Looks like the CompleteSearch server is taking too ' + \
                    'long to respond.'
        else:
            error = str(e)

    if error:
        raise app.ServerError(error)

    return jsonify(data)


def process_user_input(query):
    """
    Process the user input by stripping extra whitespaces, ensuring prefix
    search by appending asterisks to each search term, and escaping commas and
    semicolons.

    :param query: search query

    :return: processed query

    :rtype: string

    Doctests:

    >>> process_user_input('')
    ''

    >>> process_user_input('antonio vivaldi')
    'antonio* vivaldi*'

    >>> process_user_input('vivaldi, antonio')
    'vivaldi","* antonio*'

    >>> process_user_input('The . Beatles$')
    'The*.Beatles$'

    >>> process_user_input(':facet:Preis:* :facet:Preis:2.40')
    ':facet:Preis:* :facet:Preis:"2.40"'

    >>> process_user_input('magic :facet:Preis:* :facet:Preis:2.40')
    ':facet:Preis:* :facet:Preis:"2.40" magic*'

    >>> process_user_input('ge :facet:Autor:* mo*   vi$ | fr | neur.netw')
    ':facet:Autor:* ge* mo* vi$|fr*|neur*.netw*'

    >>> process_user_input('mo| fr | ge .tu')
    'mo*|fr*|ge*.tu*'
    """
    search_query = query
    facets = []
    filters = []

    # Find facets
    facet_pattern = r'(:facet:(.+?):(.+?)(?=\s+|$))'
    for match in re.findall(facet_pattern, query):
        facet_item = '"%s"' % match[2] if match[2] != '*' else match[2]
        facet = ':facet:%s:%s' % (match[1], facet_item)
        facets.append(facet)
        search_query = search_query.replace(match[0], '')

    # Find filters
    filter_pattern = r'(:filter:(.+?):(.+?)(?=\s+|$))'
    for match in re.findall(filter_pattern, query):
        filter_item = '"%s"' % match[2] if match[2] != '*' else match[2]
        filter_ = ':filter:%s:%s' % (match[1], filter_item)
        filters.append(filter_)
        search_query = search_query.replace(match[0], '')

    for match in re.findall(r'[^.| ]+', search_query):
        term = match
        if term[-1] not in '*$':
            term += '*'
        search_query = search_query.replace(match, term)

    # Substitute multiple whitespaces with a single one
    search_query = ' '.join(search_query.split())

    # Remove whitespaces around . and |
    search_query = re.sub(r'(\s*\.\s*)', '.', search_query)
    search_query = re.sub(r'(\s*\|\s*)', '|', search_query)

    # # Escape commas and semicolons
    search_query = search_query.replace(',', '","').replace(';', '";"')

    # Combine everything
    search_query = [search_query] if search_query else []
    result = ' '.join(facets + filters + search_query)

    return result


# def clean_user_input(query):
#     """ Clean user input, preserving search operators like |, $, and *.

#     >>> clean_user_input('   antonio  vivaldi | mozart.bach    ')
#     'antonio* vivaldi*|mozart*.bach*'

#     >>> clean_user_input('mo* | bach$')
#     'mo*|bach$'

#     >>> clean_user_input('mozart')
#     'mozart*'

#     >>> clean_user_input('@#johann*$ bach$')
#     'johann* bach$'

#     >>> clean_user_input('@#johann$* bach$')
#     'johann$ bach$'

#     >>> clean_user_input('^&stravinsky!?')
#     'stravinsky*'

#     >>> clean_user_input('bach$')
#     'bach$'

#     >>> clean_user_input('!!!')
#     '!!!'
#     """
#     def clean_terms(st):
#         terms = []
#         for term in st.split(' '):
#             if term != '':
#                 # If not only special characters
#                 if not re.match(r'^[_\W]+$', term):
#                     # Remove all special characters
#                     cleaned_term = re.sub(r'\W+', '', term)
#                     index = term.find(cleaned_term)
#                     try:
#                         char = term[index + len(cleaned_term)]
#                         if char == '*' or char == '$':
#                             terms.append(cleaned_term + char)
#                         else:
#                             terms.append(cleaned_term + '*')
#                     except IndexError:
#                         terms.append(cleaned_term + '*')
#                 else:
#                     return term
#         return ' '.join(terms)

#     if '.' in query or '|' in query:
#         new_query = query
#         for match in re.findall(r'[^.|]+', query):
#             cleaned_terms = clean_terms(match)
#             new_query = new_query.replace(match, cleaned_terms)
#     else:
#         new_query = clean_terms(query)

#     return new_query
