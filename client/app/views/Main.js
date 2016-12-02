import {Marionette} from '../../vendor/vendor';
import {Backbone} from '../../vendor/vendor';
import template from '../templates/main.jst';
import IndexView from './Index';
import ConfigureView from './Configure';
import ConfigCollection from '../collections/Config';
import SearchView from './Search';

export default Marionette.View.extend({
    template: template,

    regions: {
        content: '#content'
    },

    onRender() {
        if (VIEW == 'index') {
            this.showChildView('content', new IndexView());
        }
        else if (VIEW == 'configure') {
            const configCollection = new ConfigCollection();
            configCollection.fetch({
                success: () => {
                    this.showChildView('content', new ConfigureView({
                        collection: configCollection
                    }));
                }
            });
        }
        else if (VIEW == 'search') {
            this.showChildView('content', new SearchView());
        }
    }
});
