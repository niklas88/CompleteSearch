{
    baseUrl: "../lib",
    name: '../app',
    out: "app-built.js",

    paths: {
        app: '../app',
		jquery: 'jquery',
		underscore: 'underscore',
		backbone: 'backbone',
        fileupload: 'fileupload/fileupload',
        'iframe-transport': 'fileupload/iframe-transport',
        widget: 'fileupload/widget',
        material: 'material-design/material.min',
		noty: 'noty'
    },

    shim: {
        underscore: {
			exports: '_'
		},
		backbone: {
			deps: ['jquery', 'underscore'],
			exports: 'Backbone'
		},
        material: {
            deps: ['jquery']
        },
        fileupload: {
            deps: ['jquery', 'widget', 'iframe-transport']
        }
	}
}
