import Backbone from 'backbone';

export default Backbone.Model.extend({
    defaults: {
        name: '',
        count: 0,
        active: false
    }
});
