import Marionette from 'backbone.marionette';
import Noty from 'noty';
require('bootstrap-select');

import template from '../templates/settings.jst';

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
        deleteDatasetBtn: '#delete-dataset'
    },

    events: {
        'click @ui.fullTextAll': 'selectAll',
        'click @ui.allowMultipleItemsAllBtn': 'selectAll',
        'click @ui.filterAllBtn': 'selectAll',
        'click @ui.facetsAllBtn': 'selectAll',
        'click @ui.showAllBtn': 'selectAll',
        'click @ui.saveBtn': 'save',
        'click @ui.deleteDatasetBtn': 'deleteDataset',
        'change input[name=facets]': 'checkFacet'
    },

    collectionEvents: {
        // 'change:name': 'changeName'
    },

    serializeData() {
        const model = this.model.toJSON();
        return {
            title_field: model.title_field,
            within_field_separator: model.within_field_separator,
            all_fields: model.all_fields,
            allow_multiple_items: model.allow_multiple_items,
            facets: model.facets,
            filter: model.filter,
            full_text: model.full_text,
            show: model.show
        };
    },

    onAttach() {
        // Activate bootstrap-select
        if ($('.selectpicker').length !== 0) {
            $('.selectpicker').selectpicker();
        }

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

    checkFacet(e) {
        let numChecked = 0;
        _.each($('input[name=facets]'), (input) => {
            if (input.checked) {
                numChecked++;
            }
        });


        if (e.target.checked && numChecked > 5) {
            new Noty({
                type: 'warning',
                text: 'Selecting more than 5 facets might degrade the performance.'
            }).show();
        }
    },

    save() {
        const $saveBtn = this.getUI('saveBtn');
        const $deleteDatasetBtn = this.getUI('deleteDatasetBtn');
        const values = this.getFormValues();

        if (this.checkValues(values)) {
            $saveBtn.attr('disabled', true);
            $deleteDatasetBtn.attr('disabled', true);
            $.post({
                url: 'configure_dataset/',
                contentType: false,
                processData: false,
                data: JSON.stringify(values),
                success: (obj) => {
                    if (obj.success) {
                        new Noty({
                            type: 'success',
                            text: 'Dataset has been configured!',
                            timeout: 1000
                        }).show();

                        setTimeout(() => {
                            window.location.replace('.');
                        }, 1000);
                    } else {
                        new Noty({
                            type: 'error',
                            text: obj.error,
                            timeout: 1000
                        }).show();

                        setTimeout(() => {
                            window.location.replace('.');
                        }, 1000);
                    }
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    new Noty({ type: 'error', text: errorThrown }).show();
                    $saveBtn.attr('disabled', false);
                    $deleteDatasetBtn.attr('disabled', false);
                    console.error(jqXHR);
                }
            });
        }
    },

    getFormValues() {
        const data = this.getUI('form').serializeArray();

        let values = {
            full_text: [],
            show: [],
            title_field: '',
            allow_multiple_items: [],
            within_field_separator: '',
            filter: [],
            facets: []
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
            new Noty({
                type: 'warning',
                text: 'You did not select any fields for searching.'
            }).show();
            return false;
        }

        if (values.show.length === 0) {
            new Noty({
                type: 'warning',
                text: 'You did not select any <strong>Show</strong> fields.'
            }).show();
            return false;
        }

        if (values.title_field !== '' && values.show.indexOf(values.title_field) === -1) {
            new Noty({
                type: 'warning',
                text: '<strong>Title Field</strong> must be also selected in the <strong>Show</strong> fields.'
            }).show();
            return false;
        }

        return true;
    },

    deleteDataset() {
        this.getUI('saveBtn').prop('disabled', true);
        this.getUI('deleteDatasetBtn').prop('disabled', true);

        $.post('delete_dataset/', () => {
            new Noty({
                type: 'success',
                text: 'Dataset has been deleted!',
                timeout: false
            }).show();

            setTimeout(() => {
                window.location.replace('.');
            }, 1000);
        });
    }
});
