"use strict"

define(['backbone', 'app/collection/FacetItemCollection'], function(Backbone, FacetItemCollection) {

    var FacetModel = Backbone.Model.extend({
        defaults: {
            name: ''
        },

        initialize: function() {
            this.set('facetItems', new FacetItemCollection());
        }
    });

	return (FacetModel);

});
