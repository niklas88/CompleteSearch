import {Marionette, Radio} from '../../vendor/vendor';
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
        searchEnterHint: '#search-enter-hint',
        emptyText: '#empty-text',
        loader: '#loader'
    },

    events: {
        'click @ui.searchBtn': 'search',
        'enter @ui.search': 'search'
    },

    initialize() {
        const searchChannel = Radio.channel('search');
        this.listenTo(searchChannel, 'facets:update:active', this.updateActiveFacets);
        this.listenTo(searchChannel, 'facets:set:active', this.setActiveFacets);
        searchChannel.reply('facets:get:query', this.getSearchQuery.bind(this));
        searchChannel.reply('facets:get:active', this.getActiveFacets.bind(this));

        // Selected (active) facets
        this.activeFacets = {};
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

        const $search = this.getUI('search');
        const $searchEnterHint = this.getUI('searchEnterHint');

        $search.keyup((e) => {
            const query = $search.val();

            // Show/hide search hint
            // if (query !== '') {
            //     $searchEnterHint.show();
            // } else {
            //     $searchEnterHint.hide();
            //     $search.trigger('enter');
            // }

            // Search on Enter
            if (e.keyCode == 13) {
                // $searchEnterHint.hide();
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
        const query = this.getSearchQuery();
        const $emptyText = this.getUI('emptyText');
        const $loader = this.getUI('loader');
        const activeFacets = this.getActiveFacets();

        if (query) {
            $emptyText.hide();
            $loader.show();

            let url = 'search/?query=' + query;

            // Add active facets to the url
            if (Object.keys(activeFacets).length > 0) {
                url += '&active=' + JSON.stringify(activeFacets);
            }

            // Perform search using CompleteSearch
            $.getJSON(url, (obj) => {
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

                    // Redraw FacetCardList view
                    me.getRegion('facets').currentView.render();
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
        } else {
            me.getRegion('hits').empty();
            $emptyText.show();

            // Redraw FacetCardList view
            this.getRegion('facets').currentView.render();
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
    },

    getSearchQuery() {
        let query = this.getUI('search').val();
        // TODO@me: query: trim and remove js code from the query
        return query;
    },

    setActiveFacets(name) {
        if (!this.activeFacets.hasOwnProperty(name)) {
            this.activeFacets[name] = [];
        }
    },

    getActiveFacets() {
        let facets = {};

        for (let facet in this.activeFacets) {
            if (this.activeFacets.hasOwnProperty(facet) && this.activeFacets[facet].length > 0) {
                facets[facet] = this.activeFacets[facet];
            }
        }

        return facets;
    },

    updateActiveFacets(name, facet) {
        const facetName = facet.get('name');

        // Save facet
        if (this.activeFacets[name].indexOf(facetName) === -1) {
            this.activeFacets[name].push(facetName);
        } else {
            // TODO@me: delete the item from the array
        }

        // Trigger hits and facet card reload
        this.search();
    }
});
