import {$} from '../vendor/vendor';
import App from './components/App';

import bootstrap from 'bootstrap/dist/js/bootstrap.min';
import materialDesign from 'bootstrap-material-design';
import noty from 'noty';

document.addEventListener('DOMContentLoaded', () => {
    // Remove Loading animation when the page is fully loaded
    $('body').addClass('loaded');

    // Set scroll position to 0
    $('body').animate({scrollTop : 0}, 0);

    // Scroll to top
    // Check if the window is on the top. If not, then display the button
    $(window).scroll(function(){
        var level = $('nav.navbar').height() + $('.jumbotron').height() + 60;
        if ($(this).scrollTop() > level) {
            $('#scrollToTop').fadeIn();
        } else {
            $('#scrollToTop').fadeOut();
        }
    });

    // Click event to scroll to top
    $('#scrollToTop').click(() => {
        $('html, body').animate({
            scrollTop : 0
        }, 500);
        return false;
    });

    // // Set Noty default options
    $.noty.defaults.layout = 'bottomRight';
    $.noty.defaults.theme = 'relax';
    $.noty.defaults.type = 'information';
    $.noty.defaults.timeout = 5000;

    const app = new App();
    app.start();
});
