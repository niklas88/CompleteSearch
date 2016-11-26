import {Marionette} from '../../vendor/vendor';
import template from '../templates/index.jst';
import UploadView from './Upload';

export default Marionette.View.extend({
    template: template,

    ui: {
        start: '#start-button'
    },

    events: {
        'click @ui.start': 'start'
    },

    onRender() {
        this.$el = this.$el.children();
        this.$el.unwrap();
        this.setElement(this.$el);
    },

    start() {
        const contentRegion = app.getContentRegion();
        contentRegion.empty();
        contentRegion.show(new UploadView());
    }
});
