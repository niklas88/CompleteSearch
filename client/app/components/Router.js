import {Marionette, Radio} from '../../vendor/vendor';
import IndexView from '../views/Index';
import UploadView from '../views/Upload';
import SearchView from '../views/Search';
import SettingsModel from '../models/Settings';
import SettingsView from '../views/Settings';

const MainController = Marionette.Object.extend({
    initialize() {
        const appChannel = Radio.channel('app');
        this.contentRegion = appChannel.request('get:content:region');
    },

    main() {
        if (VIEW == 'index') {
            this.contentRegion.show(new IndexView());
        } else {
            this.contentRegion.show(new SearchView());
        }
    },

    showUploadView() {
        this.contentRegion.show(new UploadView());
    },

    showSettingsView() {
        const settingsModel = new SettingsModel();
        settingsModel.fetch({
            success: () => {
                this.contentRegion.show(new SettingsView({
                    model: settingsModel
                }));
            }
        });
    },
});

export default Marionette.AppRouter.extend({
    appRoutes: {
        '': 'main',
        'upload': 'showUploadView',
        'settings': 'showSettingsView'
    },

    initialize() {
        this.controller = new MainController();
    },

    // For debugging purposes
    // onRoute(name, path, args) {
    //     console.log('Navigated to ' + name);
    // }
});
