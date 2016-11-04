"use strict";

define(['jquery', 'underscore', 'backbone', 'app/module/Facet', 'app/module/Hit'], function($, _, Backbone, Facet, Hit) {
    var SearchView = Backbone.View.extend({
        template: _.template([
            '<div class="col-xs-12 col-sm-8">',
                '<div class="panel panel-default">',
                    '<div class="panel-body">',
                        '<div class="search-bar">',
                            '<div class="input-group">',
                                '<input type="search" id="search" class="form-control" placeholder="Search...">',
                                '<span class="input-group-btn">',
                                    '<button id="searchBtn" class="btn btn-raised btn-primary" type="button">',
                                        '<i class="fa fa-search" aria-hidden="true"></i>',
                                    '</button>',
                                '</span>',
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>',
                '<div class="panel panel-default">',
                    '<div class="panel-heading">Result</div>',
                    '<div class="panel-body search-result">',
                        '<div id="hits"></div>',
                        '<div id="empty-text">Nothing to show.</div>',
                        '<div id="loader"></div>',
                    '</div>',
                '</div>',
            '</div>',
            '<div class="col-sm-4 hidden-xs" id="sidebar">',
                '<div id="facets"></div>',
            '</div>'
        ].join('')),

        events: {
            'click #searchBtn': 'search',
            'enter #search': 'search'
        },

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
            this.$search = $('#search');
            this.$hits = $('#hits');
            this.$emptyText = $('#empty-text');
            this.$loader = $('#loader');
            this.$sidebar = $('#sidebar');
            this.$facets = $('#facets');

            // Search on Enter press
            this.$search.keyup(function(e) {
                if (e.keyCode == 13) {
                    $(this).trigger('enter');
                }
            });

            // Show all facets
            Facet.showAll(this.$facets);
        },

        search: function() {
            var query = this.$search.val(),
                hits = [];

            if (query) {
                this.$emptyText.hide();
                this.$loader.show();

                // TODO: perform search using CompleteSearch
                // hits = ...

                // Temporary
                for (var i = 0; i < parseInt(query); i++) {
                    hits.push({title: 'Hit ' + (i+1), description: 'Description ' + (i+1)});
                }
            }

            this.$hits.html('');
            if (hits.length > 0) {
                Hit.showAll(this.$hits, hits);
            } else {
                this.$emptyText.show();
            }
            this.$loader.hide();
        }
    });

    return (SearchView);
});
