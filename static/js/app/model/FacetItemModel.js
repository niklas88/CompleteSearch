"use strict"

define(['backbone'], function(Backbone) {

    var FacetItemModel = Backbone.Model.extend({
        defaults: {
            name: '',
            count: 0
        }
    });

	return (FacetItemModel);

});
