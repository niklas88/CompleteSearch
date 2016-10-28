require.config({
    baseUrl: '/static',
    paths: {
        app: 'js/app',
        lib: 'js/lib',
        material: 'js/lib/material-design/material.min'
    }
});

require(['material'], function() {
    $(document).ready(function() {
        // Initialize Material Design
        $.material.init();
    });
});
