import {Marionette} from '../../vendor/vendor';
import template from '../templates/upload.jst';
import SearchView from './Search';

export default Marionette.View.extend({
    template: template,

    ui: {
        upload: '#uploadBtn',
        inputFile: '#inputFile'
    },

    events: {
        'click @ui.upload': 'upload'
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

        if (inputFile[0].files.length == 1) {
            let data = new FormData();
            data.append('file', inputFile[0].files[0]);

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

                        // Change the view (UploadView -> SearchView)
                        const contentRegion = app.getRegion('app').currentView.getRegion('content');
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
                type: 'warning',
                text: 'You did not select any file.'
            });
        }
    }
});
