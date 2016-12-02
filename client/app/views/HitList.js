import {Marionette} from '../../vendor/vendor';
import template from '../templates/hits.jst';

export default Marionette.View.extend({
    template: template,

    serializeData() {
        return {
            hits: this.collection.toJSON()
        };
    }
});
