import {Marionette, Radio} from '../../vendor/vendor';
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
        'click .top-100': 'topBtnClick',
        'click .top-all': 'topAllBtnClick',
        'click .facet-item a': 'itemClick'
    },

    ui: {},

    initialize() {
        this.searchChannel = Radio.channel('search');
    },

    onRender() {
        const name = this.model.get('name');
        this.collection = new FacetItemCollection();

        // Set Active Facets array
        this.searchChannel.trigger('facets:set:active', name);

        let url = this.collection.url;
        url += '?name=' + name;

        const query = this.searchChannel.request('facets:get:query');
        const activeFacets = this.searchChannel.request('facets:get:active');

        // Add query to the url
        if (query !== '') {
            url += '&query=' + query;
        }

        // Add active facets to the url
        if (Object.keys(activeFacets).length > 0) {
            url += '&active=' + JSON.stringify(activeFacets);
        }

        this.collection.fetch({
            url: url,
            success: () => {
                if (this.collection.length > 0) {
                    if (activeFacets.hasOwnProperty(name)) {
                        for (let item of activeFacets[name]) {
                            const facet = this.collection.where('name', item);
                            facet.set('active', true);
                        }
                    }

                    // Render facet items
                    this.showChildView('items', new FacetItemsView({
                        collection: this.collection
                    }));
                    this.afterRender();
                } else {
                    // Don't show a card if there are no facet items
                    this.remove();
                }
            },
            error: (model, response, options) => {
                // debugger;
            }
        });
    },

    afterRender: function() {
        this.ui.itemsTop = $('#' + this.id() + ' .facet-items-top');
        this.ui.top5 = $('#' + this.id() + ' .facet-items-top .top-5');
        this.ui.top50 = $('#' + this.id() + ' .facet-items-top .top-50');
        this.ui.top100 = $('#' + this.id() + ' .facet-items-top .top-100');
        this.ui.topAll = $('#' + this.id() + ' .facet-items-top .top-all');
        this.showTopButtons();
    },

    showTopButtons: function() {
        const length = this.collection.length;
        const itemsTop = this.getUI('itemsTop');
        const top5 = this.getUI('top5');
        const top50 = this.getUI('top50');
        const top100 = this.getUI('top100');
        const topAll = this.getUI('topAll');

        if (length > 5) {
            itemsTop.show();
            top5.show();

            if (length < 50) {
                topAll.text('All (' + length + ')').show();
            } else if (length == 50) {
                top50.show();
            } else if (length > 50 && length < 100) {
                top50.show();
                topAll.text('All (' + length + ')').show();
            } else if (length == 100) {
                top50.show();
                top100.show();
            } else {
                top50.show();
                top100.show();
                topAll.text('All (' + length + ')').show();
            }
        }
    },

    topBtnClick: function(e) {
        const limit = parseInt(e.target.text.split(' ')[1]);

        this.collection.each((item, idx) => {
            var $item = $('#facet-item-' + item.cid).parent().parent();
            if (idx < limit) {
                $item.toggleClass('hidden', false);
            } else {
                $item.toggleClass('hidden', true);
            }
        });
    },

    topAllBtnClick: function(e) {
        this.collection.each((item) => {
            $('#facet-item-' + item.cid).parent().parent().toggleClass('hidden', false);
        });
    },

    itemClick: function(e) {
        const itemId = e.target.id.split('-')[2];

        // Save selected facet
        this.searchChannel.trigger('facets:update:active',
            this.model.get('name'),
            this.collection.get(itemId)
        );
    }
});
