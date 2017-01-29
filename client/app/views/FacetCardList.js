import {Marionette} from '../../vendor/vendor';
import FacetsListCollection from '../collections/FacetsList';
import FacetCardView from './FacetCard';

export default Marionette.CollectionView.extend({
    collection: new FacetsListCollection(),
    childView: FacetCardView
});
