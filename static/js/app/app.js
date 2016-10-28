$(document).ready(function() {
    'use strict';
    require(['app/category'], function(renderCategories) {

        var CompleteSearchAppView = Backbone.View.extend({
            el: $('#completesearchapp'),

            events: {
                'click #searchBtn': 'search',
                'enter #search': 'search'
            },

            initialize: function () {
                this.$search = $('#search');
                this.$sidebar = $('#sidebar');
                this.$categories = $('#categories');

                // Search on Enter press
                this.$search.keyup(function(e) {
                    if (e.keyCode == 13) {
                        $(this).trigger('enter');
                    }
                });

                // Render all categories
                renderCategories(this.$categories);

                this.render();
            },

            search: function() {
                var query = this.$search.val();

                if (query) {
                    // TODO: perform search using CompleteSearch
                }
            },

            render: function() {
                return this;
            }
        });

        new CompleteSearchAppView();
    });
});
