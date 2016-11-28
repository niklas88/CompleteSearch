import {Backbone} from '../../vendor/vendor';
import ConfigModel from '../models/Config';

export default Backbone.Collection.extend({
    model: ConfigModel,
    url: 'get_fields/'
});
