import {Backbone} from '../../vendor/vendor';

export default Backbone.Model.extend({
    defaults: {
        name: '',
        type: '',
        label: '',
        tooltip: '',
        fields: []
    }
});
