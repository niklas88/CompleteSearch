// import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
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
