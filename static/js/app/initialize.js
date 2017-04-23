import App from './components/App';

document.addEventListener('DOMContentLoaded', () => {
    // Remove Loading animation when the page is fully loaded
    $('body').addClass('loaded');

    // Scroll to top
    // Check if the window is on the top. If not, then display the button
    $(document).scroll(function() {
        const level = $('.page-header').height();
        if ($(this).scrollTop() > level) {
            $('#scrollToTop').fadeIn();
        } else {
            $('#scrollToTop').fadeOut();
        }
    });

    // Click event to scroll to top
    $('#scrollToTop').click((e) => {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: 0
        }, 500);
        return false;
    });

    const app = new App();
    app.start();
});
