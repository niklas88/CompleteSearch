import {Marionette} from '../../vendor/vendor';
import {Backbone} from '../../vendor/vendor';
import template from '../templates/main.jst';
import IndexView from './Index';
import SearchView from './Search';

// TODO: move it to UploadView
import ConfigCollection from '../collections/Config';
import ConfigureView from './Configure';

export default Marionette.View.extend({
    template: template,

    regions: {
        content: '#content'
    },

    onRender() {
        // if (DATABASE_UPLOADED) {
        //     this.showChildView('content', new SearchView());
        // } else {
        //     this.showChildView('content', new IndexView());
        // }

        // TODO: move it to UploadView
        const configCollection = new ConfigCollection();
        configCollection.fetch({
            success: () => {
                this.showChildView('content', new ConfigureView({
                    collection: configCollection
                }));
            }
        });
    }
});
