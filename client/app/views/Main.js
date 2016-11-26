import {Marionette} from '../../vendor/vendor';
import template from '../templates/main.jst';
import NavView from './Nav';
import IntroView from './Intro';
import UploadView from './Upload';
import ConfigureView from './Configure';
import SearchView from './Search';

export default Marionette.View.extend({
    template: template,

    regions: {
        nav: '#nav',
        intro: '#intro',
        content: '#content'
    },

    onRender() {
        this.showChildView('nav', new NavView());
        this.showChildView('intro', new IntroView());

        // if (DATABASE_UPLOADED) {
        //     this.showChildView('content', new SearchView());
        // } else {
        //     this.showChildView('content', new UploadView());
        // }

        this.showChildView('content', new ConfigureView());
    }
});
