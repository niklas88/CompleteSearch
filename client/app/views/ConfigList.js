import {Marionette} from '../../vendor/vendor';
import template from '../templates/facet.jst';
import ConfigCollection from '../collections/Config';
import ConfigView from './Config';

export default Marionette.CollectionView.extend({
    collection: new ConfigCollection(),
    childView: ConfigView,

    onAttach() {
        $.material.init();
    }
});
