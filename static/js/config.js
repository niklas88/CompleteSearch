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
    });
});
