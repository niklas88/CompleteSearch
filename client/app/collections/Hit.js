import {Backbone} from '../../vendor/vendor';
import HitModel from '../models/Hit';

export default Backbone.Collection.extend({
    model: HitModel,
    hitsPerPage: 10,
    page: 0
});
