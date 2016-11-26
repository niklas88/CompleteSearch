import {Backbone} from '../../vendor/vendor';
import FacetModel from '../models/Facet';

export default Backbone.Collection.extend({
    model: FacetModel,
    url: 'get_facets/'
});
