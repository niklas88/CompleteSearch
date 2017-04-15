import {Marionette, Radio} from '../../vendor/vendor';
import HitView from './Hit';

export default Marionette.CollectionView.extend({
    childView: HitView,

    collectionEvents: {
        'update': 'onRender'
    },

    initialize() {
        const me = this;
        const appChannel = Radio.channel('app');
        const contentRegion = appChannel.request('get:content:region');
        me.searchView = contentRegion.currentView;

        me.fetchNextPage = () => {
            const $hitList = $('#hits');
            const level = $(window).scrollTop() + $(window).height();
            const bottom = $hitList.offset().top + $hitList.height();

            if (level >= bottom) {
                $(window).off('scroll');

                if (me.collection.length < me.searchView.hits.length) {
                    me.searchView.showMore();
                }
            }
        };
    },

    onRender() {
        $(window).scroll(this.fetchNextPage);
        this.searchView.updateTotalHits(this.collection);
    }
});
