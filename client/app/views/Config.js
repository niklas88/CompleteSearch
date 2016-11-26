import {Marionette} from '../../vendor/vendor';
import template from '../templates/config-option.jst';

export default Marionette.View.extend({
    template: template,

    onRender() {
        this.$el = this.$el.children();
        this.$el.unwrap();
        this.setElement(this.$el);
    }
});
