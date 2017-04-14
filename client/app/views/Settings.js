import {Marionette, Radio} from '../../vendor/vendor';
import template from '../templates/settings.jst';
import SearchView from './Search';

export default Marionette.View.extend({
    template: template,

    ui: {
        form: '#settings-form',
        fullTextAll: '#full_text-selectAll',
        allowMultipleItemsAllBtn: '#allow_multiple_items-selectAll',
        filterAllBtn: '#filter-selectAll',
        facetsAllBtn: '#facets-selectAll',
        showAllBtn: '#show-selectAll',
        saveBtn: '#save-settings',
        deleteDatabaseBtn: '#delete-database'
    },

    events: {
        'click @ui.fullTextAll': 'selectAll',
        'click @ui.allowMultipleItemsAllBtn': 'selectAll',
        'click @ui.filterAllBtn': 'selectAll',
        'click @ui.facetsAllBtn': 'selectAll',
        'click @ui.showAllBtn': 'selectAll',
        'click @ui.saveBtn': 'save',
        'click @ui.deleteDatabaseBtn': 'deleteDatabase'
    },

    collectionEvents: {
        // 'change:name': 'changeName'
    },

    serializeData() {
        const model = this.model.toJSON();
        return {
            'title_field': model.title_field,
            'within_field_separator': model.within_field_separator,
            'all_fields': model.all_fields,
            'allow_multiple_items': model.allow_multiple_items,
            'facets': model.facets,
            'filter': model.filter,
            'full_text': model.full_text,
            'show': model.show
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
            'full_text', 'show', 'allow_multiple_items', 'filter', 'facets'
        ];

        // Check checkboxes
        for (let param of params) {
            for (let field of model.all_fields) {
                if (model[param].includes(field)) {
                    $('#' + param + '-' + field).prop('checked', true);
                }
            }
        }

        // Set Title field
        $('#title_field').val(model.title_field).change();

        // Set withinfield separator
        $('#within_field_separator').val(model.within_field_separator);

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
            $.post({
                url: 'configure_database/',
                contentType: false,
                processData: false,
                data: JSON.stringify(values),
                success: (obj) => {
                    noty({
                        type: 'success',
                        text: 'Database has been configured!'
                    });

                    // Change the view (ConfigureView -> SearchView)
                    // window.location.replace('.');
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
        // return false;
    },

    getFormValues() {
        const data = this.getUI('form').serializeArray();

        let values = {
            'full_text': [],
            'show': [],
            'title_field': '',
            'allow_multiple_items': [],
            'within_field_separator': '',
            'filter': [],
            'facets': []
        };

        for (let item of data) {
            if (item.name === 'title_field') {
                values.title_field = item.value;
            } else if (item.name === 'within_field_separator') {
                values.within_field_separator = item.value;
            } else {
                values[item.name].push(item.value);
            }
        }

        return values;
    },

    checkValues(values) {
        if (values.full_text.length === 0) {
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
    },

    deleteDatabase() {
        this.getUI('deleteDatabaseBtn').prop('disabled', true);
        $.post('delete_database/', (obj) => {
            noty({
                type: 'success',
                text: 'Database has been deleted!'
            });

            // Redirect to the main page
            setTimeout(() => {
                window.location.replace('.');
            }, 750);
        });
    }
});
