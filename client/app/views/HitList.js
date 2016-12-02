import {Marionette} from '../../vendor/vendor';
import HitView from './Hit';

export default Marionette.CollectionView.extend({
    childView: HitView,

    collectionEvents: {
        'update': 'onAdd'
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

                const searchView = app.getContentRegion().currentView;
                if (me.collection.length < searchView.hits.length) {
                    searchView.showMore();
                }
            }
        };

        $(window).scroll(this.scrollHandler);
    },

    onAdd() {
        $(window).scroll(this.scrollHandler);
    }
});
