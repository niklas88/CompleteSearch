import {Backbone} from '../../vendor/vendor';
import FacetItemModel from '../models/FacetItem';

export default Backbone.Collection.extend({
    model: FacetItemModel,
    url: 'get_facets/'
});
