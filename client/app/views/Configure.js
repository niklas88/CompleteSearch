import {Marionette} from '../../vendor/vendor';
import template from '../templates/configure.jst';

export default Marionette.View.extend({
    template: template,

    ui: {
        saveBtn: '#save-database-config-button',
        form: '#config-form'
    },

    events: {
        'click @ui.saveBtn': 'save'
    },

    onAttach() {
        $.material.init();

        setTimeout(() => {
            $('.config-tooltip').tooltip();
        }, 500);
    },

    save() {
        const values = this.getFormValues();

        if (this.checkValues(values)) {
            // debugger;
        }
    },

    getFormValues() {
        const data = this.getUI('form').serializeArray();

        let values = {
            '--title-field': [],
            '--show': [],
            '--allow-multiple-items': [],
            '--within-field-separator': [],
            '--filter': [],
            '--facets': []
        };

        for (let item of data) {
            values[item.name].push(item.value);
        }

        return values;
    },

    checkValues(values) {
        if (values['--show'].length === 0) {
            noty({
                type: 'error',
                text: 'You did not select any "Search by" fields.'
            });
            return false;
        }

        return true;
    }
});
