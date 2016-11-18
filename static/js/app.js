requirejs.config({
    baseUrl: '/static/js/lib',
    paths: {
        app: '../app',
        jquery: 'jquery',
        underscore: 'underscore',
        backbone: 'backbone',
        localstorage: 'backbone.localstorage',
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
        localstorage: {
            deps: ['underscore']
        },
        fileupload: {
            deps: ['jquery', 'widget', 'iframe-transport']
        }
    }
});

requirejs([
    'jquery', 'underscore', 'backbone', 'app/view/UploadView',
    'app/view/SearchView', 'localstorage', 'noty', 'material', 'waitme'
], function($, _, Backbone, UploadView, SearchView) {
    $(function () {
        // Remove Loading animation when the page is fully loaded
        $(document).ready(function() {
            $('body').addClass('loaded');
        });


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
        ************ Get Backbone View Plugin ************
        *************************************************/

        // Proxy the original Backbone.View setElement method:
        // See: http://backbonejs.org/#View-setElement

        var backboneSetElementOriginal = Backbone.View.prototype.setElement;

        Backbone.View.prototype.setElement = function(element) {
            if (this.el != element) {
                $(this.el).backboneView('unlink');
            }

            $(element).backboneView(this);

            return backboneSetElementOriginal.apply(this, arguments);
        };

        // Create a custom selector to search for the presence of a 'backboneView' data entry:
        // This avoids a dependency on a data selector plugin...

        $.expr[':'].backboneView = function(element, intStackIndex, arrProperties, arrNodeStack) {
            return $(element).data('backboneView') !== undefined;
        };

        // Plugin internal functions:

        var registerViewToElement = function($el, view) {
            $el.data('backboneView', view);
        };

        var getClosestViewFromElement = function($el, viewType) {
            var ret = null;

            viewType = viewType || Backbone.View;

            while ($el.length) {
                $el = $el.closest(':backboneView');
                ret = $el.length ? $el.data('backboneView') : null;

                if (ret instanceof viewType) {
                    break;
                } else {
                    $el = $el.parent();
                }
            }

            return ret;
        };

        // Extra methods:

        var methods = {
            unlink: function($el) {
                $el.removeData('backboneView');
            }
        };

        // Plugin:

        $.fn.backboneView = function() {
            var ret = this;
            var args = Array.prototype.slice.call(arguments, 0);

            if ($.isFunction(methods[args[0]])) {
                methods[args[0]](this);
            }
            else if (args[0] && args[0] instanceof Backbone.View) {
                registerViewToElement(this.first(), args[0]);
            }
            else {
                ret = getClosestViewFromElement(this.first(), args[0]);
            }

            return ret;
        };


        /*************************************************
        ******************** Main App ********************
        *************************************************/

        var SettingsModel = Backbone.Model.extend({
            defaults: {
                name: '',
                value: ''
            }
        });

        var SettingsCollection = Backbone.Collection.extend({
            model: SettingsModel,

            localStorage: new Backbone.LocalStorage('completesearch-settings'),

            getValue: function(name) {
                var setting = this.findWhere({name: name});
                if (setting) {
                    return setting.attributes.value;
                } else {
                    return;
                }
            },

            setValue: function(name, value) {
                var setting = this.findWhere({name: name});
                if (setting) {
                    setting.set('value', value);
                    setting.save();
                } else {
                    this.create({name: name, value: value});
                }
            }
        });

        var CompleteSearchAppView = Backbone.View.extend({
            el: $('#completesearchapp'),

            initialize: function () {
                // Fetch settings from localStorage
                this.settings = new SettingsCollection();
                this.settings.fetch();

                // Initial (default) setting
                if (typeof this.settings.getValue('databaseUploaded') == 'undefined') {
                    this.settings.setValue('databaseUploaded', DATABASE_UPLOADED);
                }

                if (this.settings.getValue('databaseUploaded')) {
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
            },

            changeView: function(uploadView) {
                uploadView.remove();
                new SearchView({$parent: this.$el});
                this.afterRender();
            }
        });

        new CompleteSearchAppView();
    });
});
