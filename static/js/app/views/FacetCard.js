import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
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

        const params = this.searchChannel.request('get:params');
        const searchParams = $.extend({
            name: name
        }, params);

        const facetsString = this.searchChannel.request('get:facets');
        let facets = [];
        if (facetsString !== '') {
            for (let facet of facetsString.split(' ')) {
                const item = facet.split(':');
                if (item[0] === name) {
                    facets.push(item[1]);
                }
            }
        }

        me.collection.fetch({
            data: $.param(searchParams),
            success: () => {
                if (me.collection.length > 0 && facets.length > 0) {
                    for (let facet of facets) {
                        const facetModel = me.collection.where('name', facet);
                        if (typeof facetModel !== 'undefined') {
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
            // error: (model, response, options) => {
            error: () => {
                // debugger;
            }
        });
    },

    afterRender: function() {
        // Show "No options" text if there are no facet items
        if (this.collection.length === 0) {
            $('#' + this.id() + ' .no-facet-items').show();
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
        const limit = parseInt(e.target.text.split(' ')[1], 10);

        this.collection.each((item, idx) => {
            var $item = $('#facet-item-' + item.cid).parent().parent();
            if (idx < limit) {
                $item.toggleClass('hidden', false);
            } else {
                $item.toggleClass('hidden', true);
            }
        });
    },

    topAllBtnClick: function() {
        this.collection.each((item) => {
            $('#facet-item-' + item.cid).parent().parent().toggleClass('hidden', false);
        });
    },

    itemClick: function(e) {
        const itemId = e.target.id.split('-')[2];

        // Save selected facet
        this.searchChannel.trigger('update:facets',
            this.model.get('name'),
            this.collection.get(itemId).get('value')
        );
    }
});
