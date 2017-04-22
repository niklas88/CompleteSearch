// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
    var timeout;

    return function() {
        const context = this;
        const args = arguments;

        clearTimeout(timeout);
        timeout = setTimeout(function() {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        }, wait);

        if (immediate && !timeout) {
            func.apply(context, args);
        }
    };
}


function isElementInViewport(elem) {
    const $elem = $(elem);

    // Get the scroll position of the page.
    const scrollElem = navigator.userAgent.toLowerCase().indexOf('webkit') !== -1 ? 'body' : 'html'; // eslint-disable-line
    const viewportTop = $(scrollElem).scrollTop();
    const viewportBottom = viewportTop + $(window).height();

    // Get the position of the element on the page.
    const elemTop = Math.round($elem.offset().top);
    const elemBottom = elemTop + $elem.height();

    return elemTop < viewportBottom && elemBottom > viewportTop;
}

const materialKit = {
    misc: {
        navbarMenuVisible: 0,
        windowWidth: 0,
        transparent: true,
        coloredShadows: true,
        fixedTop: false,
        navbarInitialized: false,
        isWindow: document.documentMode || /Edge/.test(navigator.userAgent) // eslint-disable-line
    },

    initAtvImg: function() {
        $('.card-atv').each(function() {
            const $atvDiv = $(this).find('.atvImg');
            const $atvImg = $atvDiv.find('img');
            const imgSrc = $atvImg.attr('src');
            const atvImageLayer = '<div class="atvImg-layer" data-img="' + imgSrc + '"/>';

            $atvDiv.css('height', $atvImg.height() + 'px');
            $atvDiv.append(atvImageLayer);

        });

        // atvImg();
    },

    initColoredShadows: function() {
        if (materialKit.misc.colored_shadows === true) {
            if (!materialKit.misc.isWindows) {
                $('.card:not([data-colored-shadow="false"]) .card-image').each(function() {
                    const $cardImg = $(this);
                    var $appendDiv = $cardImg;
                    const isOnDarkScreen = $(this).closest('.section-dark, .section-image').length;

                    // we block the generator of the colored shadows on dark sections, because they are not natural
                    if (isOnDarkScreen === 0) {
                        const imgSource = $cardImg.find('img').attr('src');
                        const isRotating = $cardImg.closest('.card-rotate').length === 1;
                        const coloredShadowDiv = $('<div class="colored-shadow"/>');

                        if (isRotating) {
                            const cardImageHeight = $cardImg.height();
                            const cardImageWidth = $cardImg.width();

                            $(this).find('.back').css({
                                height: cardImageHeight + 'px',
                                width: cardImageWidth + 'px'
                            });
                            $appendDiv = $cardImg.find('.front');
                        }

                        coloredShadowDiv.css({
                            'background-image': 'url(' + imgSource + ')'
                        }).appendTo($appendDiv);

                        if ($cardImg.width() > 700) {
                            coloredShadowDiv.addClass('colored-shadow-big');
                        }

                        setTimeout(function() {
                            coloredShadowDiv.css('opacity', 1);
                        }, 200);
                    }
                });
            }
        }
    },

    initRotateCard: debounce(function() {
        $('.card-rotate .card-image > .back').each(function() {
            const cardImageHeight = $(this).parent().height();
            const cardImageWidth = $(this).parent().width();

            $(this).css({
                height: cardImageHeight + 'px',
                width: cardImageWidth + 'px'
            });

            if ($(this).hasClass('back-background')) {
                const imgSrc = $(this).siblings('.front').find('img').attr('src');

                $(this).css('background-image', 'url("' + imgSrc + '")');
            }
        });
    }, 17),

    checkScrollForTransparentNavbar: debounce(function() {
        const $navbar = $('.navbar[color-on-scroll]');
        const scrollDistance = $navbar.attr('color-on-scroll') || 500;

        if ($(document).scrollTop() > scrollDistance) {
            if (materialKit.misc.transparent) {
                materialKit.misc.transparent = false;
                $('.navbar-color-on-scroll').removeClass('navbar-transparent');
            }
        } else {
            if (!materialKit.misc.transparent) { // eslint-disable-line
                materialKit.misc.transparent = true;
                $('.navbar-color-on-scroll').addClass('navbar-transparent');
            }
        }
    }, 17),

    initFormExtendedDatetimepickers: function() {
        $('.datetimepicker').datetimepicker({
            icons: {
                time: 'fa fa-clock-o',
                date: 'fa fa-calendar',
                up: 'fa fa-chevron-up',
                down: 'fa fa-chevron-down',
                previous: 'fa fa-chevron-left',
                next: 'fa fa-chevron-right',
                today: 'fa fa-screenshot',
                clear: 'fa fa-trash',
                close: 'fa fa-remove',
                inline: true
            }
        });

        $('.datepicker').datetimepicker({
            format: 'DD.MM.YYYY',
            icons: {
                time: 'fa fa-clock-o',
                date: 'fa fa-calendar',
                up: 'fa fa-chevron-up',
                down: 'fa fa-chevron-down',
                previous: 'fa fa-chevron-left',
                next: 'fa fa-chevron-right',
                today: 'fa fa-screenshot',
                clear: 'fa fa-trash',
                close: 'fa fa-remove',
                inline: true
            }
        });

        $('.timepicker').datetimepicker({
            format: 'H:mm',
            icons: {
                time: 'fa fa-clock-o',
                date: 'fa fa-calendar',
                up: 'fa fa-chevron-up',
                down: 'fa fa-chevron-down',
                previous: 'fa fa-chevron-left',
                next: 'fa fa-chevron-right',
                today: 'fa fa-screenshot',
                clear: 'fa fa-trash',
                close: 'fa fa-remove',
                inline: true

            }
        });
    },

    checkScrollForParallax: debounce(function() {
        const bigImage = $('.page-header[data-parallax="true"]');

        if (isElementInViewport(bigImage)) {
            // const currentScroll = $(this).scrollTop();
            const oVal = $(window).scrollTop() / 3;

            bigImage.css({
                'transform': 'translate3d(0,' + oVal + 'px,0)',
                '-webkit-transform': 'translate3d(0,' + oVal + 'px,0)',
                '-ms-transform': 'translate3d(0,' + oVal + 'px,0)',
                '-o-transform': 'translate3d(0,' + oVal + 'px,0)'
            });
        }
    }, 4)
};

$(function() {
    // Init Material scripts for buttons ripples, inputs animations etc,
    // more info on the next link https://github.com/FezVrasta/bootstrap-material-design#materialjs
    $.material.init();

    // Activate the Tooltips
    $('[data-toggle="tooltip"], [rel="tooltip"]').tooltip();

    // Activate bootstrap-select
    if ($('.selectpicker').length !== 0) {
        $('.selectpicker').selectpicker();
    }

    // Activate Popovers
    $('[data-toggle="popover"]').popover();

    // Active Carousel
    $('.carousel').carousel({
        interval: 3000
    });

    if ($('.navbar-color-on-scroll').length !== 0) {
        $(window).on('scroll', materialKit.checkScrollForTransparentNavbar);
    }

    if ($(window).width() >= 768) {
        const bigImage = $('.page-header[data-parallax="true"]');

        if (bigImage.length !== 0) {
            $(window).on('scroll', materialKit.checkScrollForParallax);
        }
    }

    // Initialise rotating cards
    materialKit.initRotateCard();

    // Initialise colored shadow
    materialKit.initColoredShadows();

    // Initialise animation effect on images
    materialKit.initAtvImg();

    // Smooth scroll to a section
    const navigationItems = $('#activities .card a');

    navigationItems.on('click', function(event) {
        event.preventDefault();
        const target = $(this.hash);

        $('body, html').animate({
            scrollTop: target.offset().top - 50
        }, 900);
    });
});

$(document).on('click', '.card-rotate .btn-rotate', function() {
    const $rotatingCardContainer = $(this).closest('.rotating-card-container');

    if ($rotatingCardContainer.hasClass('hover')) {
        $rotatingCardContainer.removeClass('hover');
    } else {
        $rotatingCardContainer.addClass('hover');
    }
});

$(document).on('click', '.navbar-toggle', function() {
    const $toggle = $(this);

    if (materialKit.misc.navbarMenuVisible === 1) {
        $('html').removeClass('nav-open');
        materialKit.misc.navbarMenuVisible = 0;
        $('#bodyClick').remove();
        setTimeout(function() {
            $toggle.removeClass('toggled');
        }, 550);
        $('html').removeClass('nav-open-absolute');
    } else {
        setTimeout(function() {
            $toggle.addClass('toggled');
        }, 580);

        const div = '<div id="bodyClick"></div>';

        $(div).appendTo('body').click(function() {
            $('html').removeClass('nav-open');

            if ($('nav').hasClass('navbar-absolute')) {
                $('html').removeClass('nav-open-absolute');
            }
            materialKit.misc.navbarMenuVisible = 0;
            $('#bodyClick').remove();
            setTimeout(function() {
                $toggle.removeClass('toggled');
            }, 550);
        });

        if ($('nav').hasClass('navbar-absolute')) {
            $('html').addClass('nav-open-absolute');
        }

        $('html').addClass('nav-open');
        materialKit.misc.navbarMenuVisible = 1;
    }
});

$(window).on('resize', function() {
    materialKit.initRotateCard();
});
