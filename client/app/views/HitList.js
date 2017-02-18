import {Marionette, Radio} from '../../vendor/vendor';
import HitView from './Hit';

export default Marionette.CollectionView.extend({
    childView: HitView,

    collectionEvents: {
        'update': 'onAdd'
    },

    initialize() {
        const appChannel = Radio.channel('app');
        const contentRegion = appChannel.request('get:content:region');
        this.searchView = contentRegion.currentView;
    },

    onRender() {
        const me = this;

        // Fetch next page on scroll
        this.scrollHandler = () => {
            const $elem = $('#hits');
            const level = $(window).scrollTop() + $(window).height();
            const bottom = $elem.offset().top + $elem.height();

            if (level >= bottom) {
                $(window).off('scroll');

                if (me.collection.length < me.searchView.hits.length) {
                    me.searchView.showMore();
                }
            }
        };

        $(window).scroll(this.scrollHandler);
    },

    onAdd() {
        $(window).scroll(this.scrollHandler);
    }
});
