import Backbone from 'backbone';

export default Backbone.Model.extend({
    defaults: {
        name: '',
        value: '',
        count: 0,
        active: false
    }
});
