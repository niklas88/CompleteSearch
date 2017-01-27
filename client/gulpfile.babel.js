import _gulp from 'gulp';
import gulpHelp from 'gulp-help';
import eslint from 'gulp-eslint';
import uglify from 'gulp-uglify';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import concat from 'gulp-concat';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import browserify from 'browserify';
import browserSync from 'browser-sync';

const gulp = gulpHelp(_gulp);
const bs = browserSync.create();

const dirs = {
    src: './resources',
    nm: './node_modules',
    dest: '../static/css'
};

const sassPaths = {
  src: [
      `${dirs.nm}/bootstrap/dist/css/bootstrap.min.css`,
    //   `${dirs.nm}/bootstrap-material-design/dist/css/bootstrap-material-design.min.css`,
      `${dirs.src}/css/lib/**/*.css`,
      `${dirs.src}/css/Main.scss`
  ],
  dest: `${dirs.dest}`
};

gulp.task('styles', 'Compile CSS/SASS styles.', () => {
    return gulp.src(sassPaths.src)
        // .pipe(sourcemaps.init())
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(concat('styles.css'))
        // .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(sassPaths.dest))
        .pipe(bs.stream());
},
{
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
        // .pipe(uglify())
        .pipe(gulp.dest('../static/js'))
        .pipe(bs.stream());
},
{
    aliases: ['c']
});

gulp.task('build', 'Completely (re-)build the client.', ['styles', 'client'], () => {},
{
    aliases: ['b']
});

gulp.task('browser-sync', false, () => {
    bs.init({
        notify: false,
        // proxy: '127.0.0.1:5000'
        // proxy: '192.168.99.100:5000'
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
},
{
    aliases: ['w']
});

gulp.task('default', ['help']);
