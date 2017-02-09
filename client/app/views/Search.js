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
        emptyText: '#empty-text',
        loader: '#loader'
    },

    events: {
        'click @ui.searchBtn': 'search',
        'enter @ui.search': 'search'
    },

    initialize() {
        const facetCardListChannel = Radio.channel('facetCardList');
        this.listenTo(facetCardListChannel, 'facets:reload', this.reloadFacetCardList);
        this.listenTo(facetCardListChannel, 'facets:set:active', this.setActiveFacets);
        facetCardListChannel.reply('facets:get:active', this.getActiveFacets);

        // Search parameters
        this.query = '';
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

            // Save the query
            me.query = query;

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
    },

    reloadFacetCardList(name, facet) {
        // Save facet
        this.activeFacets[name].push(facet.get('name'));

        // TODO@me: redraw FacetCardList view
    },

    setActiveFacets(name) {
        if (!this.activeFacets.hasOwnProperty(name)) {
            this.activeFacets[name] = [];
        }
    },

    getActiveFacets(name) {
        console.log('this', this);
        // debugger;
    }
});
