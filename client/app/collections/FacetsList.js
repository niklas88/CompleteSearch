import {Backbone} from '../../vendor/vendor';
import FacetsListModel from '../models/FacetsList';

export default Backbone.Collection.extend({
    model: FacetsListModel,
    url: 'get_facets_list/'
});
