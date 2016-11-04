"use strict"

define(['backbone', 'app/model/FacetModel'], function(Backbone, FacetModel) {

    var FacetCollection = Backbone.Collection.extend({
        model: FacetModel,
        url: 'get_facets/'
    });

	return (FacetCollection);

});
