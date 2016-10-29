/*
// App Entrypoint
*/
require([
    'app/search.view',
    'app/upload.view',
    'lib/material-design/material.min',
], function(SearchView, UploadView) {

    var CompleteSearchAppView = Backbone.View.extend({
        el: $('#completesearchapp'),

        initialize: function () {
            if (VIEW == 'search') {
                this.renderSearchView();
            } else {
                this.renderUploadView();
            }
        },

        renderSearchView: function() {
            new SearchView({$parent: this.$el});
            this.afterRender();
        },

        renderUploadView: function() {
            new UploadView({$parent: this.$el});
            this.afterRender();
        },

        afterRender: function() {
            // Initialize Material Design
            $.material.init();
        }
    });

    new CompleteSearchAppView();

});
