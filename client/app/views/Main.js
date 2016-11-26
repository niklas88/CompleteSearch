import {Marionette} from '../../vendor/vendor';
import template from '../templates/main.jst';
import IndexView from './Index';
import SearchView from './Search';

export default Marionette.View.extend({
    template: template,

    regions: {
        content: '#content'
    },

    onRender() {
        if (DATABASE_UPLOADED) {
            this.showChildView('content', new SearchView());
        } else {
            this.showChildView('content', new IndexView());
        }
    }
});
