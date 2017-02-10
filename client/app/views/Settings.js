import {Marionette} from '../../vendor/vendor';
import template from '../templates/settings.jst';
import SearchView from './Search';

export default Marionette.View.extend({
    template: template,

    ui: {
        form: '#settings-form',
        fullTextBtn: '#fullText-selectAll',
        allowMultipleItemsBtn: '#allowMultipleItems-selectAll',
        filterBtn: '#filter-selectAll',
        facetsBtn: '#facets-selectAll',
        showBtn: '#show-selectAll',
        saveBtn: '#save-settings'
    },

    events: {
        'click @ui.fullTextBtn': 'selectAll',
        'click @ui.allowMultipleItemsBtn': 'selectAll',
        'click @ui.filterBtn': 'selectAll',
        'click @ui.facetsBtn': 'selectAll',
        'click @ui.showBtn': 'selectAll',
        'submit @ui.form': 'save'
    },

    collectionEvents: {
        // 'change:name': 'changeName'
    },

    serializeData() {
        const model = this.model.toJSON();
        return {
            titleField: model.titleField,
            withinFieldSeparator: model.withinFieldSeparator,
            allFields: model.allFields,
            allowMultipleItems: model.allowMultipleItems,
            facets: model.facets,
            filter: model.filter,
            fullText: model.fullText,
            show: model.show
        };
    },

    onAttach() {
        $.material.init();

        // Beautiful select
        $('.select').dropdown({
            'dropdownClass': 'dropdown-menu',
            'optionClass': ''
        });

        const model = this.model.toJSON();
        const params = [
            'fullText', 'show', 'allowMultipleItems', 'filter', 'facets'
        ];

        // Check checkboxes
        for (let param of params) {
            for (let field of model.allFields) {
                if (model[param].includes(field)) {
                    $('#' + param + '-' + field).prop('checked', true);
                }
            }
        }

        // Set Title field
        $('#titleField').val(model.titleField);

        // Set withinfield separator
        $('#withinFieldSeparator').val(model.withinFieldSeparator);

        // Initialize tooltips
        setTimeout(() => {
            $('.config-tooltip').tooltip();
        }, 500);
    },

    selectAll(e) {
        const param = $(e.target).attr('id').replace('-selectAll', '');
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
        return false;
    },

    getFormValues() {
        const data = this.getUI('form').serializeArray();

        let values = {
            'fullText': [],
            'show': [],
            'titleField': '',
            'allowMultipleItems': [],
            'withinFieldSeparator': '',
            'filter': [],
            'facets': []
        };

        for (let item of data) {
            if (item.name === 'titleField') {
                values.titleField = item.value;
            } else if (item.name === 'withinFieldSeparator') {
                values.withinFieldSeparator = item.value;
            } else {
                values[item.name].push(item.value);
            }
        }

        return values;
    },

    checkValues(values) {
        if (values.fullText.length === 0) {
            noty({
                type: 'error',
                text: 'You did not select any fields for searching.'
            });
            return false;
        }

        if (values.show.length === 0) {
            noty({
                type: 'error',
                text: 'You did not select any "Show" fields.'
            });
            return false;
        }

        return true;
    }
});
