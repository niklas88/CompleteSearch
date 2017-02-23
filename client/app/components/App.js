import {Backbone, Marionette} from '../../vendor/vendor';
import MainView from '../views/Main';
import Router from './Router';

export default Marionette.Application.extend({
    region: '#app',

    initialize() {
        window.app = this;
    },

    onStart() {
        this.showView(new MainView());
        const router = new Router();

        // Start URL handling
        Backbone.history.start();
    }
});
