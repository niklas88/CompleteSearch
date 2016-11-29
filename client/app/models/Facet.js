import {Backbone} from '../../vendor/vendor';
import FacetItemCollection from '../collections/FacetItem';

export default Backbone.Model.extend({
    defaults: {
        name: ''
    },

    initialize() {
        this.set('facetItems', new FacetItemCollection());
    }
});
