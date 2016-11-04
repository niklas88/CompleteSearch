"use strict"

define(['backbone', 'app/model/FacetItemModel'], function(Backbone, FacetItemModel) {

    var FacetItemCollection = Backbone.Collection.extend({
        model: FacetItemModel
    });

	return (FacetItemCollection);

});
