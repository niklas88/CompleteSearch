import {Marionette} from '../../vendor/vendor';
import MainView from '../views/Main';

export default Marionette.Application.extend({
    region: '#app',

    initialize() {
        window.app = this;
        this.on('start', () => {
            this.showView(new MainView());
        });
    },

    getContentRegion() {
        return this.getRegion('app').currentView.getRegion('content');
    }
});
