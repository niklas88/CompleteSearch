require([
    'jquery',
    'lib/noty/jquery.noty.packaged.min',
    'app/app'
], function($) {
    $(document).ready(function() {
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

    // Set Noty default options
    $.noty.defaults.layout = 'bottomRight';
    // $.noty.defaults.theme = 'bootstrapTheme';
    $.noty.defaults.type = 'information';
    $.noty.defaults.timeout = 5000;
});
