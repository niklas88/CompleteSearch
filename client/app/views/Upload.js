import {Marionette} from '../../vendor/vendor';
import template from '../templates/upload.jst';
// import ConfigureView from './Configure';
// import ConfigCollection from '../collections/Config';
import SearchView from './Search';

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
        $.material.init();
    },

    upload() {
        let inputFile = this.getUI('inputFile');
        const supportedFileTypes = [
            'text/tab-separated-values',
            'text/csv',
            'text/plain',
            'text/xml'
        ];

        if (inputFile[0].files.length == 1) {
            const file = inputFile[0].files[0];

            if (supportedFileTypes.indexOf(file.type) > -1) {
                let data = new FormData();
                data.append('file', file);

                // TODO: set loader

                $.ajax({
                    url: 'upload_file/',
                    type: 'POST',
                    data: data,
                    cache: false,
                    dataType: 'json',
                    processData: false,
                    contentType: false,
                    success: (data) => {
                        // TODO: stop loader

                        if (data.success) {
                            noty({
                                type: 'success',
                                text: 'File has been uploaded!'
                            });

                            // // Change the view (UploadView -> ConfigureView)
                            // const configCollection = new ConfigCollection();
                            // configCollection.fetch({
                            //     success: () => {
                            //         const contentRegion = app.getContentRegion();
                            //         contentRegion.empty();
                            //         contentRegion.show(new ConfigureView({
                            //             collection: configCollection
                            //         }));
                            //     }
                            // });

                            // Change the view (UploadView -> SearchView)
                            const contentRegion = app.getContentRegion();
                            contentRegion.empty();
                            contentRegion.show(new SearchView());

                        } else {
                            // TODO: stop loader

                            noty({
                               type: 'error',
                               text: data.error
                            });
                        }
                    },
                    error: (jqXHR, textStatus, errorThrown) => {
                        // TODO: set loader
                        noty({
                           type: 'error',
                           text: textStatus
                        });
                        // console.error('[ERROR]: ' + textStatus);
                    }
                });
            } else {
                noty({
                    type: 'error',
                    text: 'This file type is not supported.'
                });
            }
        } else {
            noty({
                type: 'warning',
                text: 'You did not select any file.'
            });
        }
    }
});
