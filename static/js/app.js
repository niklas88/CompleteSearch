requirejs.config({
    baseUrl: '/static/js/lib',
    paths: {
        app: '../app',
        jquery: 'jquery',
        underscore: 'underscore',
        backbone: 'backbone',
        fileupload: 'fileupload/fileupload',
        'iframe-transport': 'fileupload/iframe-transport',
        widget: 'fileupload/widget',
        material: 'material-design/material.min',
        noty: 'noty',
        waitme: 'waitme'
    },
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['jquery', 'underscore'],
            exports: 'Backbone'
        },
        material: {
            deps: ['jquery']
        },
        noty: {
            deps: ['jquery']
        },
        waitme: {
            deps: ['jquery']
        },
        fileupload: {
            deps: ['jquery', 'widget', 'iframe-transport']
        }
    }
});

requirejs([
    'jquery', 'underscore', 'backbone', 'app/view/UploadView',
    'app/view/SearchView', 'noty', 'material', 'waitme'
], function($, _, Backbone, UploadView, SearchView) {
    $(function () {
        // Scroll to top
        // Check if the window is on the top. If not, then display the button
        $(window).scroll(function(){
            var level = $('nav.navbar').height() + $('.jumbotron').height() + 60;
            if ($(this).scrollTop() > level) {
                $('#scrollToTop').fadeIn();
            } else {
                $('#scrollToTop').fadeOut();
            }
        });

        // Click event to scroll to top
        $('#scrollToTop').click(function(){
            $('html, body').animate({
                scrollTop : 0
            }, 500);
            return false;
        });

        // Set Noty default options
        $.noty.defaults.layout = 'bottomRight';
        // $.noty.defaults.theme = 'bootstrapTheme';
        $.noty.defaults.type = 'information';
        $.noty.defaults.timeout = 5000;


        /*************************************************
        ******************** Main App ********************
        *************************************************/

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
});
