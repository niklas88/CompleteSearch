import {Marionette, Radio} from '../../vendor/vendor';
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
        const appChannel = Radio.channel('app');
        const contentRegion = appChannel.request('get:content:region');
        contentRegion.show(new UploadView());
    }
});
