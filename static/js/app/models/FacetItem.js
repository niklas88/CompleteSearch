import Backbone from 'backbone';

export default Backbone.Model.extend({
    defaults: {
        name: '',
        title: '',
        count: 0,
        active: false
    }
});
