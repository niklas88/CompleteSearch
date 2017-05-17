import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import Noty from 'noty';

import template from '../templates/facetCard.jst';
import FacetItemCollection from '../collections/FacetItem';
import FacetItemsView from './FacetItems';

export default Marionette.View.extend({
    template: template,

    regions: {
        items: {
            el: 'ul',
            replaceElement: true
        }
    },

    id() {
        return 'facet-' + this.model.cid;
    },

    events: {
        'click .top-5': 'topBtnClick',
        'click .top-50': 'topBtnClick',
        'click .top-250': 'topBtnClick',
        'click .top-all': 'topAllBtnClick',
        'click .facet-item a': 'itemClick'
    },

    ui: {},

    initialize() {
        this.searchChannel = Radio.channel('search');
    },

    onRender() {
        const me = this;

        const name = this.model.get('name');
        me.collection = new FacetItemCollection();

        const facets = this.searchChannel.request('get:facets');
        const searchParams = this.searchChannel.request('get:params');
        const params = $.extend({
            name: name
        }, searchParams);

        me.collection.fetch({
            data: $.param(params),
            success: () => {
                if (me.collection.length > 0 && facets.length > 0) {
                    for (let facet of facets) {
                        const facetModel = me.collection.where({ value: facet })[0];
                        if (facetModel) {
                            facetModel.set('active', true);
                        }
                    }
                }

                // Render facet items
                me.showChildView('items', new FacetItemsView({
                    collection: me.collection
                }));
                me.afterRender();
            },
            error: (collection, response) => {
                const error = JSON.parse(response.responseText).message;
                const text = 'Cannot get facets for <strong>' + name +
                             '</strong>:<br/>' + error;

                new Noty({
                    type: 'error',
                    text: text
                }).show();
            }
        });
    },

    afterRender: function() {
        // Hide "No options" text if there are facet items
        if (this.collection.length !== 0) {
            $('#' + this.id() + ' .no-facet-items').hide();
        }

        this.ui.itemsTop = $('#' + this.id() + ' .facet-items-top');
        this.ui.top5 = $('#' + this.id() + ' .facet-items-top .top-5');
        this.ui.top50 = $('#' + this.id() + ' .facet-items-top .top-50');
        this.ui.top250 = $('#' + this.id() + ' .facet-items-top .top-250');
        this.ui.topAll = $('#' + this.id() + ' .facet-items-top .top-all');
        this.showTopButtons();
    },

    showTopButtons: function() {
        const length = this.collection.length;
        const itemsTop = this.getUI('itemsTop');
        const top5 = this.getUI('top5');
        const top50 = this.getUI('top50');
        const top250 = this.getUI('top250');
        const topAll = this.getUI('topAll');

        if (length > 5) {
            itemsTop.show();
            top5.show();

            if (length < 50) {
                topAll.text('All (' + length + ')').show();
            } else if (length === 50) {
                top50.show();
            } else if (length > 50 && length < 250) {
                top50.show();
                topAll.text('All (' + length + ')').show();
            } else {
                top50.show();
                top250.show();
            }
        }
    },

    topBtnClick: function(e) {
        const numItems = parseInt(e.target.text.split(' ')[1], 10);

        this.collection.each((item, idx) => {
            var $item = $('#facet-item-' + item.cid).closest('li');
            if (idx < numItems) {
                $item.toggleClass('hidden', false);
            } else {
                $item.toggleClass('hidden', true);
            }
        });
    },

    topAllBtnClick: function(e) {
        this.collection.each((item) => {
            $('#facet-item-' + item.cid).closest('li').toggleClass('hidden', false);
        });
    },

    itemClick: function(e) {
        const itemId = e.target.id.split('-')[2];

        this.searchChannel.trigger('update:facets',
            this.collection.get(itemId).get('value')
        );
    }
});
