import {Marionette} from '../../vendor/vendor';
import template from '../templates/hit.jst';

export default Marionette.View.extend({
    tagName: 'div',
    template: template,

    onRender() {
        this.$el = this.$el.children();
        this.$el.unwrap();
        this.setElement(this.$el);
    }
});
