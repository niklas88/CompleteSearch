import re
import json
import cgi

# from html.parser import HTMLParser
from urllib.request import urlopen
from urllib.parse import quote, unquote
from urllib.error import URLError, HTTPError

from flask import Blueprint, request, current_app as app, jsonify
# from html5lib.filters.sanitizer import allowed_elements

bp = Blueprint('search', __name__)


# class MLStripper(HTMLParser):
#     def __init__(self):
#         super().__init__()
#         self.reset()
#         self.strict = False
#         self.convert_charrefs = True
#         self.elements = set()
#         self.fed = []

#     def handle_endtag(self, tag):
#         self.elements.add(tag)

#     def handle_data(self, d):
#         self.fed.append(d)

#     def get_data(self):
#         return ''.join(self.fed)

#     def handle_starttag(self, tag, attrs):
#         self.elements.add(tag)


@bp.route('/get_facets_list/', methods=['GET'])
def get_facets_list():
    """ Return the list of facets. """
    settings = app.settings.to_dict()
    facets_list = [{'name': facet} for facet in sorted(settings['facets'])]
    return jsonify(facets_list)


@bp.route('/get_facets/', methods=['GET'])
def get_facets():
    """ Return all facets for a given field name. """
    error = ''
    data = []

    def facet_item_dict(item, facet_query):
        value = item['text'].replace(facet_query, '')
        title = cgi.escape(value).replace('_', ' ')
        return {
            'name': title,
            'value': value,
            'count': item['@oc'],
        } if value != '_' else {}

    search_query = request.args.get('query', '').lower().strip()
    facet_name = request.args.get('name', '')
    facets = request.args.get('facets', '')

    try:
        if facet_name != '':
            facet_query = ':facet:%s:' % facet_name

            if search_query:
                search_query = clean_user_input(search_query)
                search_query += ' '

            facet_items = ''
            for facet in facets.split():
                for group in re.findall(r'^(.+?):(.+)$', facet):
                    facet_items += ':facet:%s:"%s" ' % (group[0], group[1])

            combined_query = quote(search_query + facet_items +
                                   facet_query + '*')

            url = 'http://0.0.0.0:8888/?q=%s&h=0&c=250&format=json' % \
                combined_query

            response = urlopen(url)
            content = str(response.read(), 'utf-8').replace('\r\n', '')
            result = json.loads(content)['result']
            completions = result['completions']

            # status = result['status']['@code']  # TODO@me: check the status
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
        if e.__class__ == URLError:
            error = str(e.reason)
        elif e.__class__ == HTTPError:
            error = str(e.reason)
            app.logger.error('URL: "%s"' % unquote(url))
        else:
            error = str(e)

    if error:
        raise app.ServerError(error)

    # Get rid of empty items
    data = [x for x in data if x != {}]
    return jsonify(data)


@bp.route('/search/', methods=['GET'])
def search():
    """ Perform search using CompleteSearch. """
    settings = app.settings.to_dict()
    error = ''
    data = []

    search_query = request.args.get('query', '').lower().strip()
    facets = request.args.get('facets', '')
    start = request.args.get('start', 0)
    hits_per_page = request.args.get('hits_per_page', 20)

    try:
        if search_query != '' or facets != '':
            if search_query:
                search_query = clean_user_input(search_query)

            facet_items = ''
            for facet in facets.split():
                for group in re.findall(r'^(.+?):(.+)$', facet):
                    facet_items += ':facet:%s:"%s" ' % (group[0], group[1])

            if facet_items:
                search_query += ' '

            combined_query = quote(search_query + facet_items)
            url = 'http://0.0.0.0:8888/?q=%s&f=%s&h=%s&format=json' % (
                combined_query, start, hits_per_page)

            response = urlopen(url)
            content = str(response.read(), 'utf-8').replace('\r\n', '')
            result = json.loads(content)['result']
            hits = result['hits']
            show_fields = sorted(settings['show'])
            if int(hits['@sent']) > 0:
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

    except Exception as e:
        app.logger.exception(e)
        if e.__class__ == URLError:
            error = str(e.reason)
        elif e.__class__ == HTTPError:
            error = str(e.reason)
            app.logger.error('URL: "%s"' % unquote(url))
        else:
            error = str(e)

    if error:
        raise app.ServerError(error)

    return jsonify(data)


# def remove_html(html):
#     """ Remove all html tags in a given text. """
#     elements = set([x[1] for x in allowed_elements])
#     s = MLStripper()
#     s.feed(html)

#     if s.elements.intersection(elements):  # html document
#         result = s.get_data()
#     else:
#         result = html.replace('<', '').replace('>', '')
#     return result


def clean_user_input(query):
    """ Clean user input, preserving search operators like |, $, and *.

    >>> clean_user_input('   antonio  vivaldi | mozart.bach    ')
    'antonio* vivaldi*|mozart*.bach*'

    >>> clean_user_input('mo* | bach$')
    'mo*|bach$'

    >>> clean_user_input('mozart')
    'mozart*'

    >>> clean_user_input('@#johann*$ bach$')
    'johann* bach$'

    >>> clean_user_input('@#johann$* bach$')
    'johann$ bach$'

    >>> clean_user_input('^&stravinsky!?')
    'stravinsky*'

    >>> clean_user_input('bach$')
    'bach$'

    >>> clean_user_input('!!!')
    '!!!'
    """
    def clean_terms(st):
        terms = []
        for term in st.split(' '):
            if term != '':
                # If not only special characters
                if not re.match(r'^[_\W]+$', term):
                    # Remove all special characters
                    cleaned_term = re.sub(r'\W+', '', term)
                    index = term.find(cleaned_term)
                    try:
                        char = term[index + len(cleaned_term)]
                        if char == '*' or char == '$':
                            terms.append(cleaned_term + char)
                        else:
                            terms.append(cleaned_term + '*')
                    except IndexError:
                        terms.append(cleaned_term + '*')
                else:
                    return term
        return ' '.join(terms)

    if '.' in query or '|' in query:
        new_query = query
        for match in re.findall(r'[^.|]+', query):
            cleaned_terms = clean_terms(match)
            new_query = new_query.replace(match, cleaned_terms)
    else:
        new_query = clean_terms(query)

    return new_query
