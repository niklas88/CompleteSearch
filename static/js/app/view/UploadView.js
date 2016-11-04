"use strict";

define(['jquery', 'underscore', 'backbone', 'fileupload'], function($, _, Backbone) {
    var UploadView = Backbone.View.extend({
        template: _.template([
            '<div class="col-xs-12">',
                '<div id="panel-upload" class="panel panel-default">',
                    '<div class="panel-body">',
                        '<div class="col-md-6 col-md-offset-3">',
                            '<h4>You can upload your own database, using the form below:</h4>',
                            '<div id="upload-form" class="form-group">',
                                '<input type="file" id="inputFile" name="file" >',
                                '<div class="input-group">',
                                    '<input id="fileName" type="text" readonly="" class="form-control" placeholder="Select a file...">',
                                    '<span class="input-group-btn input-group-sm">',
                                        '<button type="button" id="" class="btn btn-fab btn-fab-mini">',
                                            '<i class="fa fa-upload" aria-hidden="true"></i>',
                                        '</button>',
                                    '</span>',
                                '</div>',
                            '</div>',
                            '<p><strong>*Note: </strong>XML, CSV, TSV and TXT (with whatever separated data) are only accepted.</p>',
                            '<div class="text-center">',
                                '<button id="uploadBtn" class="btn btn-raised btn-primary">Upload</button>',
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>'
        ].join('')),

        events: {},

        initialize: function(options) {
            this.options = options;
            this.render();
        },

        render: function() {
            this.$el.html(this.template());
            this.options.$parent.html(this.$el);
            this.afterRender();
            return this;
        },

        afterRender: function() {
            // Initialize File Uploading
            $('#inputFile').fileupload({
                url: 'upload_file/',
                dataType: 'json',
                acceptFileTypes: /(\.|\/)(xml|csv|tsv|txt)$/i,  // doesn't work!
                add: function (e, data) {
                    $('#fileName').val(data.files[0].name);

                    data.context = $('#uploadBtn').click(function() {
                        $('#panel-upload').waitMe({
                            effect: 'win8_linear',
                            text: 'Uploading and processing...',
                            bg: 'rgba(158,158,158,0.9)',
                            color: '#f5f5f5'
                        });
                        data.submit();
                    });
                },
                done: function (e, data) {
                    $('#panel-upload').waitMe('hide');

                    if (data.result.success) {
                        noty({
                            type: 'success',
                            text: 'File has been uploaded!'
                        });

                        // TODO: change view 'upload' -> 'search'
                    } else {
                        noty({
                            type: 'error',
                            text: data.result.error
                        });
                    }
                }
            });
        }
    });

    return (UploadView);
});
