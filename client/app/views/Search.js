import {Marionette} from '../../vendor/vendor';
import template from '../templates/search.jst';
import FacetListView from './FacetList';

export default Marionette.View.extend({
    template: template,

    regions: {
        facets: '#facets'
    },

    ui: {
        searchBtn: '#searchBtn',
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

        const facetListView = new FacetListView();

        // Show all facets
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
        const search = this.getUI('search');
        search.keyup((e) => {
            if (e.keyCode == 13) {
                search.trigger('enter');
            }
        });
    },

    onAttach() {
        // Initialize Material Design
        $.material.init();
    },

    search() {
        let query = this.getUI('search').val(),
            $emptyText = this.getUI('emptyText'),
            $loader = this.getUI('loader');

        // TODO: query: trim, remove js code

        if (query) {
            $emptyText.hide();
            $loader.show();

            // debugger;
        }
    }
});
