$(document).ready(function() {
    'use strict';
    require(['app/category', 'app/hit'], function(Category, Hit) {

        var CompleteSearchAppView = Backbone.View.extend({
            el: $('#completesearchapp'),

            events: {
                'click #searchBtn': 'search',
                'enter #search': 'search'
            },

            initialize: function () {
                this.$search = $('#search');
                this.$hits = $('#hits');
                this.$emptyText = $('#empty-text');
                this.$loader = $('#loader');
                this.$sidebar = $('#sidebar');
                this.$categories = $('#categories');

                // Search on Enter press
                this.$search.keyup(function(e) {
                    if (e.keyCode == 13) {
                        $(this).trigger('enter');
                    }
                });

                // Show all categories
                Category.showAll(this.$categories);

                this.render();
            },

            search: function() {
                var query = this.$search.val(),
                    hits = [];

                if (query) {
                    this.$emptyText.hide();
                    this.$loader.show();

                    // TODO: perform search using CompleteSearch
                    // hits = ...
                }

                // Temporary
                for (var i = 0; i < parseInt(query); i++) {
                    hits.push({title: 'Hit ' + (i+1), description: 'Description ' + (i+1)});
                }

                this.$hits.html('');
                if (hits.length > 0) {
                    Hit.showAll(this.$hits, hits);
                } else {
                    this.$emptyText.show();
                }
                this.$loader.hide();
            },

            render: function() {
                return this;
            }
        });

        new CompleteSearchAppView();
    });
});
