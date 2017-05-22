import Marionette from 'backbone.marionette';
import Noty from 'noty';

import template from '../templates/upload.jst';

export default Marionette.View.extend({
    template: template,

    ui: {
        inputFile: '#input-file',
        useFirstRow: '#use_first_row',
        uploadButton: '#upload-button',
        cancelButton: '#cancel-button',
        progressBar: '#progressBar'
    },

    events: {
        'click @ui.uploadButton': 'upload',
        'click @ui.cancelButton': 'cancelUpload'
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
        const me = this;
        const inputFile = this.getUI('inputFile');
        const useFirstRow = this.getUI('useFirstRow').prop('checked');
        const $uploadButton = this.getUI('uploadButton');
        const $cancelButton = this.getUI('cancelButton');
        const $progressBar = this.getUI('progressBar');

        if (inputFile[0].files.length === 1) {
            const file = inputFile[0].files[0];

            let data = new FormData();
            data.append('file', file);
            data.append('use_first_row', useFirstRow);

            $uploadButton.hide();
            $cancelButton.show();

            me.xhr = $.ajax({
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
                            const percent = Math.round(e.loaded / e.total * 100);

                            $progressBar
                                .attr('aria-valuenow', percent)
                                .css('width', percent + '%');

                            if (percent === 100) {
                                new Noty({
                                    text: 'Processing... It might take some time.',
                                    timeout: false
                                }).show();
                            }
                        }
                    });
                    return xhr;
                },
                success: (obj) => {
                    if (obj.success) {
                        me.saveDataset(obj.data);
                    } else {
                        me.showErrorMessage(obj.error);
                    }
                },
                error: (jqXHR, textStatus) => {
                    if (textStatus !== 'abort') {
                        me.showErrorMessage(textStatus);
                        console.error(jqXHR);
                    }
                }
            });
        } else {
            new Noty({
                type: 'warning',
                text: 'You did not select any file.'
            }).show();
        }
    },

    saveDataset(data) {
        const me = this;
        $.post({
            url: 'save_uploaded_dataset/',
            contentType: false,
            processData: false,
            data: JSON.stringify(data),
            success: (obj) => {
                if (obj.success) {
                    new Noty({
                        type: 'success',
                        text: 'File has been uploaded!',
                        timeout: false
                    }).show();

                    setTimeout(() => {
                        // Change the view (UploadView -> SearchView)
                        window.location.replace('.');
                    }, 1000);
                } else {
                    me.showErrorMessage(obj.error);
                }
            },
            error: (jqXHR, textStatus, errorThrown) => {
                me.showErrorMessage(errorThrown);
                console.error(jqXHR);
            }
        });
    },

    showErrorMessage(message) {
        const $uploadButton = this.getUI('uploadButton');
        const $cancelButton = this.getUI('cancelButton');

        $uploadButton.show();
        $cancelButton.hide();
        new Noty({ type: 'error', text: message, timeout: false }).show();
    },

    cancelUpload() {
        const $progressBar = this.getUI('progressBar');
        const $uploadButton = this.getUI('uploadButton');
        const $cancelButton = this.getUI('cancelButton');

        if (this.xhr) {
            this.xhr.abort();
            this.xhr = null;

            $uploadButton.show();
            $cancelButton.hide();
            Noty.closeAll();

            $progressBar
                .attr('aria-valuenow', 0)
                .css('width', '0%');
        }
    }
});
