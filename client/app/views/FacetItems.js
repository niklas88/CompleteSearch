import {Marionette} from '../../vendor/vendor';
import template from '../templates/facetItems.jst';

export default Marionette.View.extend({
    template: template,

    serializeData() {
        return {
            items: this.collection
        };
    },

    onRender() {
        this.$el = this.$el.children();
        this.$el.unwrap();
        this.setElement(this.$el);
    }
});