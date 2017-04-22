import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import MainView from '../views/Main';
import Router from './Router';

export default Marionette.Application.extend({
    region: '#app',

    initialize() {
        window.app = this;
    },

    onStart() {
        this.showView(new MainView());
        new Router();

        // Start URL handling
        Backbone.history.start();
    }
});
