var sass = require('gulp-sass');
var cleanCss = require('gulp-clean-css');
var autoprefixer = require('autoprefixer');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var gulpif = require('gulp-if');
var header = require('gulp-header');
var Eyeglass = require('eyeglass');

var eyeglass = new Eyeglass({
    importer: function (uri, prev, done) {
        done(sass.compiler.types.NULL);
    },
    eyeglass: {
        enableImportOnce: false
    }
});

module.exports = function (gulp, opts) {
    return function () {
        gulp.src(opts.PROJECT_PATTERNS.sass)
            // sourcemaps can be activated through `gulp sass --debug´
            .pipe(gulpif(opts.DEBUG, sourcemaps.init()))
            .pipe(sass(eyeglass.options))
            .on('error', function (error) {
                gutil.log(gutil.colors.red(
                    'Error (' + error.plugin + '): ' + error.messageFormatted)
                );
                // inform the client about the errors in SASS compilation
                if (process.env.EXIT_ON_ERRORS) {
                    process.exit(1);
                }
            })
            .pipe(
                postcss([
                    autoprefixer({
                        // browsers are coming from browserslist file
                        cascade: false
                    })
                ])
            )
            .pipe(cleanCss({
                rebase: false
            }))
            // sourcemaps can be activated through `gulp sass --debug´
            .pipe(header('/* This file generated automatically on server side. All changes would be lost. */ \n\n'))
            .pipe(gulpif(opts.DEBUG, sourcemaps.write()))
            .pipe(gulp.dest(opts.PROJECT_PATH.css));
    };
};
