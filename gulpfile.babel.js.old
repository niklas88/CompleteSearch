const _gulp = require('gulp');
const gulpHelp = require('gulp-help');
const eslint = require('gulp-eslint');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const browserSync = require('browser-sync');
const util = require('gulp-util');
const gulpif = require('gulp-if');

const gulp = gulpHelp(_gulp);
const bs = browserSync.create();

const dirs = {
    src: './resources',
    nm: './node_modules'
};

const sassPaths = {
    src: [
        `${dirs.nm}/bootstrap/dist/css/bootstrap.min.css`,
        // `${dirs.nm}/bootstrap-material-design/dist/css/bootstrap-material-design.min.css`,
        `${dirs.src}/css/lib/**/*.css`,
        `${dirs.src}/css/Main.scss`
    ],
    dest: '../static/css'
};

gulp.task('styles', 'Compile CSS/SASS styles.', () => {
    return gulp.src(sassPaths.src)
        // .pipe(sourcemaps.init())
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(concat('styles.css'))
        // .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(sassPaths.dest))
        .pipe(bs.stream());
}, {
    aliases: ['s']
});

gulp.task('client', 'Rebuild the client (JS only).', () => {
    var bundler = browserify('./app/initialize.js', {
        transform: [
            ['babelify', {
                'presets': ['es2015']
            }],
            ['jstify']
        ]
    });

    return bundler.bundle()
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(eslint())
        // .pipe(eslint.format())
        // minify if --prod option is present
        .pipe(gulpif(
            typeof util.env.prod !== 'undefined',
            uglify().on('error', util.log))
        )
        .pipe(gulp.dest('../static/js'))
        .pipe(bs.stream());
}, {
    aliases: ['c']
});

gulp.task('build', 'Completely (re-)build the client.', ['styles', 'client'], () => {}, {
    aliases: ['b']
});

gulp.task('browser-sync', false, () => {
    bs.init({
        notify: false,
        // proxy: '127.0.0.1:5000'
        proxy: 'localhost:5000'
    });
});

gulp.task('watch', 'Watch script and styles changes.', ['browser-sync'], () => {
    // Watch script changes
    gulp.watch('./resources/css/**/*', ['styles']);
    gulp.watch('../static/css/*').on('change', bs.reload);

    // Watch styles changes/
    gulp.watch('app/**/*', ['client']);
    gulp.watch('../static/js/*').on('change', bs.reload);
}, {
    aliases: ['w']
});

gulp.task('default', ['help']);
