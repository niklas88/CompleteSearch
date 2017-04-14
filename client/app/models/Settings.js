import {Backbone} from '../../vendor/vendor';

export default Backbone.Model.extend({
    urlRoot: '/get_settings/',
    defaults: {
        'title_field': '',
        'within_field_separator': '',
        'all_fields': [],
        'allow_multiple_items': [],
        'facets': [],
        'filter': [],
        'full_text': [],
        'show': []
    }
});
