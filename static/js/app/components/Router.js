import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
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
        if (VIEW === 'index') {  // eslint-disable-line
            this.contentRegion.show(new IndexView());
        } else {
            this.contentRegion.show(new SearchView({
                params: {}
            }));
        }
    },

    showUploadView() {
        if (DATABASE_UPLOADED) {  // eslint-disable-line
            this.main();
        } else {
            // Show the view only if the database is not uploaded
            this.contentRegion.show(new UploadView());
        }
    },

    showSearchView(args) {
        // Show the view only if the database is uploaded
        if (DATABASE_UPLOADED) {  // eslint-disable-line
            if (this.contentRegion.currentView &&
                this.contentRegion.currentView.viewId &&
                this.contentRegion.currentView.viewId === 'searchView') {

                // Set initial params from the URL bar
                this.contentRegion.currentView.setParams(
                    $.deparam(args ? args : '')
                );

                // Trigger search function
                this.contentRegion.currentView.search();
            } else {
                // Render SearchView only if doesn't exist yet
                // or if the view is changed
                this.contentRegion.show(new SearchView({
                    params: args ? $.deparam(args) : {}
                }));
            }
        } else {
            this.main();
        }
    },

    showSettingsView() {
        // Show the view only if the database is uploaded
        if (DATABASE_UPLOADED) {  // eslint-disable-line
            const settingsModel = new SettingsModel();
            settingsModel.fetch({
                success: () => {
                    this.contentRegion.show(new SettingsView({
                        model: settingsModel
                    }));
                }
            });
        } else {
            this.main();
        }
    }
});

export default Marionette.AppRouter.extend({
    appRoutes: {
        '': 'main',
        'upload': 'showUploadView',
        'search': 'showSearchView',
        'settings': 'showSettingsView'
    },

    initialize() {
        this.controller = new MainController();

        // Disable HitList scroll event handler (fetchNextPage)
        this.on('all', function() {
            $(window).off('scroll');
        });
    }

    // For debugging purposes
    // onRoute(name, path, args) {
    //     console.log('Navigated to: ' + name);
    // }
});
