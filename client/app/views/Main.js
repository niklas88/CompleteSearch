import {Marionette} from '../../vendor/vendor';
import template from '../templates/main.jst';
import IndexView from './Index';
import SearchView from './Search';

// TODO: move it to UploadView
import ConfigsModel from '../models/Configs';
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
        const configsModel = new ConfigsModel();
        configsModel.fetch({
            success: () => {
                this.showChildView('content', new ConfigureView({
                    model: configsModel
                }));
            }
        });
    }
});
