import {Marionette} from '../../vendor/vendor';
import template from '../templates/search.jst';
import FacetListView from './FacetList';
import HitCollection from '../collections/Hit';
import HitListView from './HitList';

export default Marionette.View.extend({
    template: template,

    regions: {
        hits: '#hits',
        facets: '#facets'
    },

    ui: {
        searchBtn: '#search-button',
        search: '#search',
        emptyText: '#empty-text',
        loader: '#loader'
    },

    events: {
        'click @ui.searchBtn': 'search',
        'enter @ui.search': 'search'
    },

    onRender() {
        this.$el = this.$el.children();
        this.$el.unwrap();
        this.setElement(this.$el);

        // Show all facets
        const facetListView = new FacetListView();
        facetListView.collection.fetch({
            success: () => {
                facetListView.collection.each((facet) => {
                    const items = facet.get('items');
                    facet.get('facetItems').add(items);
                    facet.unset('items');
                });
                this.showChildView('facets', facetListView);
            }
        });

        // Search on Enter
        const $search = this.getUI('search');
        $search.keyup((e) => {
            if (e.keyCode == 13) {
                $search.trigger('enter');
            }
        });
    },

    onAttach() {
        // Initialize Material Design
        $.material.init();

        $('footer').toggleClass('footer-white', true);
    },

    search() {
        const me = this;
        const query = this.getUI('search').val();
        const $emptyText = this.getUI('emptyText');
        const $loader = this.getUI('loader');

        // TODO: query: trim, remove js code

        if (query) {
            $emptyText.hide();
            $loader.show();

            // Perform search using CompleteSearch
            $.getJSON('search/?query=' + query, (obj) => {
                // me.$hits.html('');

                if (obj.success) {
                    if (obj.data.length > 0) {
                        const hits = new HitCollection();
                        hits.add(obj.data);

                        // Show all hits
                        me.showChildView('hits', new HitListView({
                            collection: hits
                        }));
                    } else {
                        me.getRegion('hits').empty();
                        $emptyText.show();
                        noty({
                            type: 'warning',
                            text: 'No hits.'
                        });
                    }
                } else {
                    me.getRegion('hits').empty();
                    $emptyText.show();
                    noty({
                        type: 'error',
                        text: obj.error
                    });
                }

                $loader.hide();
            });
        }
    }
});
