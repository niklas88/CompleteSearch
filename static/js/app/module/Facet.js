"use strict";

define(['jquery', 'underscore', 'backbone', 'app/collection/FacetCollection'],
function ($, _, Backbone, FacetCollection) {

    var FacetView = Backbone.View.extend({
        tagName: 'div',
        className: 'panel panel-primary panel-facet',

        events: {
            'click .top-5': 'topBtnClick',
            'click .top-50': 'topBtnClick',
            'click .top-100': 'topBtnClick',
            'click .top-all': 'topAllBtnClick'
        },

        template: _.template([
            '<div class="panel-heading">',
                '<h3 class="panel-title">Refine by <%= name %></h3>',
            '</div>',
            '<div class="panel-body">',
                '<ul class="facet-items">',
                    '<% facetItems.each(function(item, idx) { %>',
                        '<% if (idx > 4) { %>',
                            '<li class="hidden">',
                        '<% } else { %>',
                            '<li>',
                        '<% } %>',
                        '<a id="facet-item-<%= item.cid %>" href="javascript:void(0)"><%= item.attributes.name %></a> <span class="label label-default pull-right"><%= item.attributes.count %></span></li>',
                    '<% }); %>',
                '</ul>',
                '<div class="facet-items-top">',
                    '<hr>',
                    '<a href="javascript:void(0)" class="btn btn-primary btn-sm top-5">Top 5</a>',
                    '<a href="javascript:void(0)" class="btn btn-primary btn-sm top-50">Top 50</a>',
                    '<a href="javascript:void(0)" class="btn btn-primary btn-sm top-100">Top 100</a>',
                    '<a href="javascript:void(0)" class="btn btn-primary btn-sm top-all">All</a>',
                '</div>',
            '</div>'
        ].join('')),

        initialize: function() {
            this.listenTo(this.model, 'remove', this.remove);
        },

        remove: function(model) {
            $('#facet-' + model.cid).remove();
        },

        render: function($parent) {
            this.$el.html(this.template(this.model.toJSON()));
            $parent.append(this.$el);
            this.afterRender();
            return this;
        },

        afterRender: function() {
            // Initialize Top buttons for each view
            this.$itemsTop = $('#' + this.id + ' .facet-items-top');
            this.$top5 = $('#' + this.id + ' .facet-items-top .top-5');
            this.$top50 = $('#' + this.id + ' .facet-items-top .top-50');
            this.$top100 = $('#' + this.id + ' .facet-items-top .top-100');
            this.$topAll = $('#' + this.id + ' .facet-items-top .top-all');
            this.showTopButtons();
        },

        showTopButtons: function() {
            var length = this.model.attributes.facetItems.length;

            if (length > 5) {
                this.$itemsTop.show();
                this.$top5.show();

                if (length < 50) {
                    this.$topAll.text('All (' + length +')').show();
                } else if (length == 50) {
                    this.$top50.show();
                } else if (length > 50 && length < 100 ) {
                    this.$top50.show();
                    this.$topAll.text('All (' + length +')').show();
                } else if (length == 100) {
                    this.$top50.show();
                    this.$top100.show();
                } else {
                    this.$top50.show();
                    this.$top100.show();
                    this.$topAll.text('All (' + length +')').show();
                }
            }
        },

        topBtnClick: function(e) {
            var limit = parseInt(e.target.text.split(' ')[1]);
            this.model.attributes.facetItems.each(function(facetItem, idx) {
                var $item = $('#facet-item-' + facetItem.cid).parent();
                if (idx < limit) {
                    $item.toggleClass('hidden', false);
                } else {
                    $item.toggleClass('hidden', true);
                }
            });
        },

        topAllBtnClick: function() {
            this.model.attributes.facetItems.each(function(item) {
                $('#facet-item-' + item.cid).parent().toggleClass('hidden', false);
            });
        }
    });

    var showAll = function($facets) {
        var facetCollection = new FacetCollection();
        facetCollection.fetch({
            success: function(facets) {
                facets.each(function(facet) {
                    // Populate items
                    facet.attributes.facetItems.add(facet.attributes.items);
                    facet.unset('items');

                    var view = new FacetView({
                        id: 'facet-' + facet.cid,
                        model: facet
                    });

                    view.render($facets);
                }, this);
            }
        });
    };

    return {
        showAll: showAll
    };
});
