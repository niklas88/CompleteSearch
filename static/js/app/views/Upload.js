import Marionette from 'backbone.marionette';
import Noty from 'noty';

import template from '../templates/upload.jst';

export default Marionette.View.extend({
    template: template,

    ui: {
        uploadButton: '#upload-button',
        inputFile: '#input-file'
    },

    events: {
        'click @ui.uploadButton': 'upload'
    },

    onRender() {
        this.$el = this.$el.children();
        this.$el.unwrap();
        this.setElement(this.$el);
    },

    onAttach() {
        // Initialize Material Design
        // $.material.init();
    },

    upload() {
        let inputFile = this.getUI('inputFile');
        const supportedFileTypes = [
            'text/tab-separated-values',
            'text/csv',
            'text/plain'
        ];

        if (inputFile[0].files.length === 1) {
            const file = inputFile[0].files[0];

            if (supportedFileTypes.indexOf(file.type) !== -1) {
                let data = new FormData();
                data.append('file', file);

                // TODO@me: set loader here

                $.ajax({
                    url: 'upload_file/',
                    type: 'POST',
                    data: data,
                    cache: false,
                    dataType: 'json',
                    processData: false,
                    contentType: false,
                    success: (obj) => {
                        // TODO: stop loader

                        if (obj.success) {
                            new Noty({
                                type: 'success',
                                text: 'File has been uploaded!'
                            }).show();

                            // Change the view (UploadView -> SearchView)
                            window.location.replace('.');
                        } else {
                            // TODO: stop loader
                            new Noty({
                                type: 'error',
                                text: obj.error
                            }).show();
                        }
                    },
                    error: (jqXHR, textStatus) => {
                        // TODO: set loader
                        new Noty({
                            type: 'error',
                            text: textStatus
                        }).show();
                        // console.error('[ERROR]: ' + textStatus);
                    }
                });
            } else {
                new Noty({
                    type: 'error',
                    text: 'This file type is not supported.'
                }).show();
                console.error('Supported file types:', supportedFileTypes);
                console.error('Current file type:', file.type);
            }
        } else {
            new Noty({
                type: 'warning',
                text: 'You did not select any file.'
            }).show();
        }
    }
});
