// ###########################################################################
// IMPORTS
var argv = require('minimist')(process.argv.slice(2));
var gulp = require('gulp');

// ###########################################################################
// SETTINGS
var PROJECT_ROOT = __dirname;
var PROJECT_PATH = {
    css: PROJECT_ROOT + '/static/css',
    html: PROJECT_ROOT + '/templates',
    images: PROJECT_ROOT + '/static/img',
    js: PROJECT_ROOT + '/static/js',
    sass: PROJECT_ROOT + '/static/sass'
};
var PROJECT_PATTERNS = {
    images: [
        PROJECT_PATH.images + '/**/*'
    ],
    js: [
        'gulpfile.js',
        PROJECT_PATH.js + '/**/*.js',
        // exclude from linting
        '!' + PROJECT_PATH.js + '/*.min.js',
        '!' + PROJECT_PATH.js + '/**/*.min.js',
        '!' + PROJECT_PATH.js + '/dist/*.js'
    ],
    sass: [
        PROJECT_PATH.sass + '/**/*.{scss,sass}'
    ]
};

var DEFAULT_PORT = 5000;
var PORT = parseInt(process.env.PORT, 10) || DEFAULT_PORT;
var DEBUG = argv.debug;


/**
 * Checks project deployment
 * @param {String} id - task name
 * @returns {Object} - task which finished
 */
function task (id) {
    return require('./gulp_tasks/' + id)(gulp, {
        PROJECT_ROOT: PROJECT_ROOT,
        PROJECT_PATH: PROJECT_PATH,
        PROJECT_PATTERNS: PROJECT_PATTERNS,
        DEBUG: DEBUG,
        PORT: PORT,
        argv: argv
    });
}

gulp.task('lint:javascript', task('lint/javascript'));
gulp.task('lint', ['lint:javascript']);
gulp.task('sass', task('sass'));
gulp.task('webpack:once', task('webpack/once'));
gulp.task('webpack:watch', task('webpack/watch'));
gulp.task('build', ['sass', 'webpack:once']);

/**
 * GULP_MODE === 'production' means we have a limited
 * subset of tasks, namely sass, bower and lint to
 * speed up the deployment / installation process.
 */
if (process.env.GULP_MODE !== 'production') {
    gulp.task('images', task('images'));
    gulp.task('preprocess', ['sass', 'images']);
    gulp.task('browser', task('browser'));
}

gulp.task('watch', function () {
    gulp.start('webpack:watch');
    gulp.watch(PROJECT_PATTERNS.sass, ['sass']);
    gulp.watch(PROJECT_PATTERNS.js, ['lint']);
});

gulp.task('default', ['sass', 'lint', 'watch']);
