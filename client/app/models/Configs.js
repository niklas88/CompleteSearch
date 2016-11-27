import {Backbone} from '../../vendor/vendor';

export default Backbone.Model.extend({
    url: 'get_fields/',

    defaults: {
        fields: []
    }
});
