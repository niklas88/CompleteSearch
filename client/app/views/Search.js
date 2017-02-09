import {Marionette} from '../../vendor/vendor';
import template from '../templates/search.jst';
import FacetCardListView from './FacetCardList';
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

        // Show all facet cards
        const facetCardListView = new FacetCardListView();
        facetCardListView.collection.fetch({
            success: () => {
                this.showChildView('facets', facetCardListView);
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

        // $('footer').toggleClass('footer-white', true);
    },

    search() {
        const me = this;
        const query = this.getUI('search').val();
        const $emptyText = this.getUI('emptyText');
        const $loader = this.getUI('loader');

        // TODO: query: trim, remove js code from the query

        if (query) {
            $emptyText.hide();
            $loader.show();

            // Perform search using CompleteSearch
            $.getJSON('search/?query=' + query, (obj) => {
                if (obj.success) {
                    if (obj.data.length > 0) {
                        // Save all fetched hits
                        me.hits = new HitCollection(obj.data);

                        // Show hits for the 1st page
                        me.showChildView('hits', new HitListView({
                            collection: new HitCollection(me.getData(me.hits.page))
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
    },

    getData(page) {
        const hitsPerPage = this.hits.hitsPerPage;
        const start = page * hitsPerPage;
        const end = start + hitsPerPage;
        return this.hits.slice(start, end);
    },

    showMore() {
        const hits = this.getData(++this.hits.page);
        const hitCollection = this.getRegion('hits').currentView.collection;
        hitCollection.add(hits);
    }
});
