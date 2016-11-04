"use strict";

define(['jquery', 'underscore', 'backbone', 'app/collection/FacetCollection'],
function ($, _, Backbone, FacetCollection) {

    var FacetView = Backbone.View.extend({
        tagName: 'div',
        className: 'panel panel-primary panel-facet',

        template: _.template([
            '<div class="panel-heading">',
                '<h3 class="panel-title">Refine by <%= name %></h3>',
            '</div>',
            '<div class="panel-body">',
                '<ul class="facet-items">',
                    '<% facetItems.each(function(item) { %>',
                        '<li><a id="facet-item-<%= item.cid %>" href="javascript:void(0)"><%= item.attributes.name %></a> (<%= item.attributes.count %>)</li>',
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

        render: function() {
            return this.$el.html(this.template(this.model.toJSON()));
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

                    $facets.append(view.render());
                }, this);
            }
        });
    };

    return {
        showAll: showAll
    };
});
