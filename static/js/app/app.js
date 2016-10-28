$(document).ready(function() {
    'use strict';
    require(['app/category'], function(Category) {

        var CompleteSearchAppView = Backbone.View.extend({
            el: $('#completesearchapp'),

            initialize: function () {
                var me = this;

                me.search = $('#search');
                // me.sidebar = $('#sidebar');
                me.categories = $('#categories');

                // Render all categories
                var categoryCollection = new Category.CategoryCollection();
                categoryCollection.fetch({
                    success: function(categories) {
                        categories.each(function(category) {
                            var view = new Category.CategoryView({
                                id: 'cat-' + category.cid,
                                model: category
                            });
                            me.categories.append(view.render());
                        }, this);
                    }
                });

                me.render();
            },

            render: function() {
                return this;
            }
        });

        new CompleteSearchAppView();
    });
});
