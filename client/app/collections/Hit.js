import {Backbone} from '../../vendor/vendor';
import HitModel from '../models/Hit';

export default Backbone.Collection.extend({
    url: 'search/',
    model: HitModel,
    hitsPerPage: 10,
    page: 0
});
