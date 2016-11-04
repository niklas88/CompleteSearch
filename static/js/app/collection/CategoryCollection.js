"use strict"

define(['backbone'], function(Backbone) {

    var CategoryCollection = Backbone.Collection.extend({
        url: 'get_categories/'
    });

	return (CategoryCollection);

});
