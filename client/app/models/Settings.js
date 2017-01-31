import {Backbone} from '../../vendor/vendor';

export default Backbone.Model.extend({
    urlRoot: '/get_settings/',
    defaults: {
        titleField: '',
        withinFieldSeparator: '',
        allFields: [],
        allowMultipleItems: [],
        facets: [],
        filter: [],
        fullText: [],
        show: []
    }
});
