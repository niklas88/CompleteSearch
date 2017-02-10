import {Backbone, Marionette, Radio} from '../../vendor/vendor';
import template from '../templates/main.jst';
import IndexView from './Index';
import SettingsView from './Settings';
import SettingsModel from '../models/Settings';
import SearchView from './Search';

export default Marionette.View.extend({
    template: template,

    regions: {
        content: '#content'
    },

    ui: {
        settingsBtn: '#settings-button'
    },

    events: {
        'click @ui.settingsBtn': 'showSettings'
    },

    initialize() {
        const appChannel = Radio.channel('app');
        appChannel.reply('get:content:region', this.getContentRegion.bind(this));
    },

    onRender() {
        if (VIEW == 'index') {
            this.showChildView('content', new IndexView());
        } else if (VIEW == 'search') {
            this.showChildView('content', new SearchView());
        }
    },

    showSettings() {
        const settingsModel = new SettingsModel();
        settingsModel.fetch({
            success: () => {
                this.showChildView('content', new SettingsView({
                    model: settingsModel
                }));
            }
        });
    },

    getContentRegion() {
        return this.getRegion('content');
    }
});
