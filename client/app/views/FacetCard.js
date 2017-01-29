import {Marionette} from '../../vendor/vendor';
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
        'click .top-all': 'topAllBtnClick'
    },

    ui: {},

    onRender() {
        this.collection = new FacetItemCollection();
        this.collection.url += '?name=' + this.model.get('name');
        this.collection.fetch({
            success: () => {
                this.showChildView('items', new FacetItemsView({
                    collection: this.collection
                }));
                this.afterRender();
            },
            error: (model, response, options) => {
                // debugger;
            }
        });
    },

    afterRender: function() {
        this.ui.itemsTop = $('#' + this.id() + ' .facet-items-top');
        this.ui.top5     = $('#' + this.id() + ' .facet-items-top .top-5');
        this.ui.top50    = $('#' + this.id() + ' .facet-items-top .top-50');
        this.ui.top100   = $('#' + this.id() + ' .facet-items-top .top-100');
        this.ui.topAll   = $('#' + this.id() + ' .facet-items-top .top-all');
        this.showTopButtons();
    },

    showTopButtons: function() {
        const length    = this.collection.length;
        const itemsTop  = this.getUI('itemsTop');
        const top5      = this.getUI('top5');
        const top50     = this.getUI('top50');
        const top100    = this.getUI('top100');
        const topAll    = this.getUI('topAll');

        if (length > 5) {
            itemsTop.show();
            top5.show();

            if (length < 50) {
                topAll.text('All (' + length +')').show();
            } else if (length == 50) {
                top50.show();
            } else if (length > 50 && length < 100 ) {
                top50.show();
                topAll.text('All (' + length +')').show();
            } else if (length == 100) {
                top50.show();
                top100.show();
            } else {
                top50.show();
                top100.show();
                topAll.text('All (' + length +')').show();
            }
        }
    },

    topBtnClick: function(e) {
        const limit = parseInt(e.target.text.split(' ')[1]);

        this.collection.each((item, idx) => {
            var $item = $('#facet-item-' + item.cid).parent();
            if (idx < limit) {
                $item.toggleClass('hidden', false);
            } else {
                $item.toggleClass('hidden', true);
            }
        });
    },

    topAllBtnClick: function(a, b, c) {
        this.collection.each((item) => {
            $('#facet-item-' + item.cid).parent().toggleClass('hidden', false);
        });
    }
});
