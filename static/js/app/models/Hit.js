import Backbone from 'backbone';

export default Backbone.Model.extend({
    defaults: {
        titleField: '',
        fields: [],
        total: 0
    }
});
