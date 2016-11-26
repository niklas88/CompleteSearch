import {Marionette} from '../../vendor/vendor';
import template from '../templates/configure.jst';
import ConfigListView from './ConfigList';

export default Marionette.View.extend({
    template: template,

    regions: {
        // config: '#config-options'
        config: {
            el: '#config-options',
            replaceElement: true
        }
    },

    ui: {
        saveBtn: '#save-database-config-button',
        form: '#config-form'
    },

    events: {
        'click @ui.saveBtn': 'save'
    },

    onRender() {
        const configListView = new ConfigListView();

        configListView.collection.fetch({
            success: () => {
                this.showChildView('config', configListView);
            }
        });
    },

    onAttach() {
        $.material.init();

        setTimeout(() => {
            $('.config-tooltip').tooltip();
        }, 500);
    },

    save() {
        // debugger;
    }
});
