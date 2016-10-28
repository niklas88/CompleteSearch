// Category Module
define(['app/category'], function (Category) {

    var CategoryCollection = Backbone.Collection.extend({
        url: 'get_categories/'
    });

    var CategoryView = Backbone.View.extend({
        tagName: 'div',
        className: 'panel panel-primary',

        template: _.template(`
            <div class="panel-heading">
                <h3 class="panel-title">Refine by <%= title %></h3>
            </div>
            <div class="panel-body">
                <%= content %>
            </div>
        `),

        initialize: function() {
            this.listenTo(this.model, 'remove', this.remove);
        },

        remove: function(model) {
            $('#cat-' + model.cid).remove();
        },

        render: function() {
            return this.$el.html(this.template(this.model.toJSON()));
        }
    });

    return {
        CategoryCollection: CategoryCollection,
        CategoryView: CategoryView
    };
});
