import {Backbone} from '../../vendor/vendor';

export default Backbone.Model.extend({
    defaults: {
        name: '',
        count: 0,
        active: false
    }
});
