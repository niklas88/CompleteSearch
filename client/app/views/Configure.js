import {Marionette} from '../../vendor/vendor';
import template from '../templates/configure.jst';
import SearchView from './Search';

export default Marionette.View.extend({
    template: template,

    ui: {
        form                    : '#config-form',
        fullTextBtn             : '#--full-text-select-all',
        allowMultipleItemsBtn   : '#--allow-multiple-items-select-all',
        filterBtn               : '#--filter-select-all',
        facetsBtn               : '#--facets-select-all',
        showBtn                 : '#--show-select-all',
        saveBtn                 : '#save-database-config-button'
    },

    events: {
        'click @ui.fullTextBtn'             : 'selectAll',
        'click @ui.allowMultipleItemsBtn'   : 'selectAll',
        'click @ui.filterBtn'               : 'selectAll',
        'click @ui.facetsBtn'               : 'selectAll',
        'click @ui.showBtn'                 : 'selectAll',
        'click @ui.saveBtn'                 : 'save'
    },

    collectionEvents: {
        // 'change:name': 'changeName'
    },

    serializeData() {
        return {
            fields: this.collection.toJSON()
        };
    },

    onAttach() {
        $.material.init();

        setTimeout(() => {
            $('.config-tooltip').tooltip();
        }, 500);
    },

    selectAll(e) {
        const param = $(e.target).attr('id').replace('-select-all', '');
        const inputs = $('input[name=' + param + ']');

        $.each(inputs, (idx, input) => {
            $(input).prop('checked', true);
        });
    },

    save() {
        const values = this.getFormValues();

        if (this.checkValues(values)) {
            $.ajax({
                url: 'configure_database/',
                method: 'POST',
                contentType: false,
                processData: false,
                data: JSON.stringify(values),
                success: (obj) => {
                    noty({
                        type: 'success',
                        text: 'Database has been configured!'
                    });

                    // Change the view (ConfigureView -> SearchView)
                    const contentRegion = app.getContentRegion();
                    contentRegion.empty();
                    contentRegion.show(new SearchView());
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    console.error(jqXHR);
                    noty({
                        type: 'error',
                        text: errorThrown
                    });
                }
            });
        }
    },

    getFormValues() {
        const data = this.getUI('form').serializeArray();

        let values = {
            '--full-text'               : [],
            '--show'                    : [],
            '--title-field'             : [],
            '--allow-multiple-items'    : [],
            '--within-field-separator'  : [],
            '--filter'                  : [],
            '--facets'                  : []
        };

        for (let item of data) {
            values[item.name].push(item.value);
        }

        return values;
    },

    checkValues(values) {
        if (values['--full-text'].length === 0 &&
            values['--filter'].length === 0 &&
            values['--facets'].length === 0) {
            noty({
                type: 'error',
                text: 'You did not select any fields for searching.'
            });
            return false;
        }

        if (values['--show'].length === 0) {
            noty({
                type: 'error',
                text: 'You did not select any "Show" fields.'
            });
            return false;
        }

        return true;
    }
});
