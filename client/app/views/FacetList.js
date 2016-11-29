import {Marionette} from '../../vendor/vendor';
import template from '../templates/facet.jst';
import FacetCollection from '../collections/Facet';
import FacetView from './Facet';

export default Marionette.CollectionView.extend({
    collection: new FacetCollection(),
    childView: FacetView
});
