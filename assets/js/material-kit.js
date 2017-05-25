/*! =========================================================
 *
 * Material Kit PRO - V1.1.0
 *
 * =========================================================
 *
 * Product Page: https://www.creative-tim.com/product/material-kit-pro
 * Available with purchase of license from http://www.creative-tim.com/product/material-kit-pro
 * Copyright 2017 Creative Tim (https://www.creative-tim.com)
 * License Creative Tim (https://www.creative-tim.com/license)
 *
 * ========================================================= */

var big_image;

$(document).ready(function(){

    // Init Material scripts for buttons ripples, inputs animations etc, more info on the next link https://github.com/FezVrasta/bootstrap-material-design#materialjs
    $.material.init();

    window_width = $(window).width();

    $navbar = $('.navbar[color-on-scroll]');
    scroll_distance = $navbar.attr('color-on-scroll') || 500;

    $navbar_collapse = $('.navbar').find('.navbar-collapse');

    if($('.navbar-color-on-scroll').length != 0){
        $(window).on('scroll', materialKit.checkScrollForTransparentNavbar)
    }

    if (window_width >= 768){
        big_image = $('.page-header[data-parallax="true"]');
        if(big_image.length != 0){
            $(window).on('scroll', materialKitDemo.checkScrollForParallax);
        }
    }
 });

$(document).on('click', '.card-rotate .btn-rotate', function(){
    var $rotating_card_container = $(this).closest('.rotating-card-container');

    if ($rotating_card_container.hasClass('hover')){
        $rotating_card_container.removeClass('hover');
    } else {
        $rotating_card_container.addClass('hover');
    }
});

$(document).on('click', '.navbar-toggle', function(){
    $toggle = $(this);

    if (materialKit.misc.navbar_menu_visible == 1) {
        $('html').removeClass('nav-open');
        materialKit.misc.navbar_menu_visible = 0;
        $('#bodyClick').remove();
        setTimeout(function(){
            $toggle.removeClass('toggled');
        }, 550);

        $('html').removeClass('nav-open-absolute');
    } else {
         setTimeout(function(){
             $toggle.addClass('toggled');
         }, 580);


         div = '<div id="bodyClick"></div>';
         $(div).appendTo("body").click(function() {
             $('html').removeClass('nav-open');

             if($('nav').hasClass('navbar-absolute')){
                 $('html').removeClass('nav-open-absolute');
             }
             materialKit.misc.navbar_menu_visible = 0;
             $('#bodyClick').remove();
              setTimeout(function(){
                 $toggle.removeClass('toggled');
              }, 550);
         });

         if($('nav').hasClass('navbar-absolute')){
             $('html').addClass('nav-open-absolute');
         }

         $('html').addClass('nav-open');
         materialKit.misc.navbar_menu_visible = 1;
     }
});

materialKit = {
    misc:{
         navbar_menu_visible: 0,
         window_width: 0,
         transparent: true,
         colored_shadows: true,
         fixedTop: false,
         navbar_initialized: false,
         isWindow: document.documentMode || /Edge/.test(navigator.userAgent)
    },

    checkScrollForTransparentNavbar: debounce(function() {
            if($(document).scrollTop() > scroll_distance ) {
                if(materialKit.misc.transparent) {
                    materialKit.misc.transparent = false;
                    $('.navbar-color-on-scroll').removeClass('navbar-transparent');
                }
            } else {
                if( !materialKit.misc.transparent ) {
                    materialKit.misc.transparent = true;
                    $('.navbar-color-on-scroll').addClass('navbar-transparent');
                }
            }
    }, 17),
}

materialKitDemo = {
    checkScrollForParallax: debounce(function(){
        if(isElementInViewport(big_image)){
            var current_scroll = $(this).scrollTop();
            oVal = ($(window).scrollTop() / 3);
            big_image.css({
                 'transform':'translate3d(0,' + oVal +'px,0)',
                 '-webkit-transform':'translate3d(0,' + oVal +'px,0)',
                 '-ms-transform':'translate3d(0,' + oVal +'px,0)',
                 '-o-transform':'translate3d(0,' + oVal +'px,0)'
            });
        }
    }, 4)
}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        }, wait);
        if (immediate && !timeout) func.apply(context, args);
    };
};

function isElementInViewport(elem) {
    var $elem = $(elem);

    // Get the scroll position of the page.
    var scrollElem = ((navigator.userAgent.toLowerCase().indexOf('webkit') != -1) ? 'body' : 'html');
    var viewportTop = $(scrollElem).scrollTop();
    var viewportBottom = viewportTop + $(window).height();

    // Get the position of the element on the page.
    var elemTop = Math.round( $elem.offset().top );
    var elemBottom = elemTop + $elem.height();

    return ((elemTop < viewportBottom) && (elemBottom > viewportTop));
}
