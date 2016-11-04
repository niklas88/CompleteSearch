"use strict";

define(['underscore', 'backbone'], function (_, Backbone) {

    var HitView = Backbone.View.extend({
        tagName: 'div',
        className: 'hit',

        template: _.template([
            '<div class="hit-title">',
                '<h4><%= title %></h4>',
            '</div>',
            '<div class="hit-description">',
                '<%= description %>',
            '</div>'
        ].join('')),

        render: function() {
            return this.$el.html(this.template(this.model));
        }
    });

    var showAll = function($hits, hits) {
        _.each(hits, function(hit) {
            var view = new HitView({
                model: hit
            });
            $hits.append(view.render());
        });
    };

    return {
        showAll: showAll
    };
});
