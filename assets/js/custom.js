$(function() {
    // Smooth scroll to a section
    var navigationItems = $('a[href="#features"], a[href="#modules"]');
    navigationItems.on('click', function(event) {
        event.preventDefault();
        var target = $(this.hash);
        $('body, html').animate({
            scrollTop: target.offset().top
        }, 800);
    });
});
