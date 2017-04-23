import Marionette from 'backbone.marionette';
import Noty from 'noty';

import template from '../templates/upload.jst';

export default Marionette.View.extend({
    template: template,

    ui: {
        inputFile: '#input-file',
        uploadButton: '#upload-button',
        progressBar: '#progressBar'
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
        const inputFile = this.getUI('inputFile');
        const $uploadButton = this.getUI('uploadButton');
        const $progressBar = this.getUI('progressBar');
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

                $uploadButton.attr('disabled', true);
                $.ajax({
                    url: 'upload_file/',
                    type: 'POST',
                    data: data,
                    cache: false,
                    dataType: 'json',
                    processData: false,
                    contentType: false,
                    xhr: function() {
                        const xhr = new window.XMLHttpRequest();
                        xhr.upload.addEventListener('progress', function(e) {
                            if (e.lengthComputable) {
                                const percent = Math.round((e.loaded / e.total) * 100);

                                $progressBar
                                    .attr('aria-valuenow', percent)
                                    .css('width', percent + '%');

                                if (percent === 100) {
                                    new Noty({
                                        text: 'Processing...',
                                        timeout: false
                                    }).show();
                                }
                            }
                        });
                        return xhr;
                    },
                    success: (obj) => {
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
                        $uploadButton.attr('disabled', false);
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
