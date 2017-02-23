import {Backbone, Marionette, Radio} from '../../vendor/vendor';
import template from '../templates/main.jst';

export default Marionette.View.extend({
    template: template,

    regions: {
        content: '#content'
    },

    initialize() {
        const appChannel = Radio.channel('app');
        appChannel.reply('get:content:region', this.getContentRegion.bind(this));
    },

    getContentRegion() {
        return this.getRegion('content');
    }
});
