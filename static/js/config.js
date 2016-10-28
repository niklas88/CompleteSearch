require.config({
    baseUrl: '/static',
    paths: {
        app: 'js/app',
        lib: 'js/lib'
    }
});

require(['lib/material-design/material.min'], function() {
    $(document).ready(function() {
        // Initialize Material Design
        $.material.init();

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
        $('#scrollToTop').click(function(){
            $('html, body').animate({
                scrollTop : 0
            }, 800);
            return false;
        });
    });
});
