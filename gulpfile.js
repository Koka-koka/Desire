const { src, dest, watch, parallel, series }  = require('gulp');

const scss           = require('gulp-sass')(require('sass'));
const concat         = require('gulp-concat');
const browserSync    = require('browser-sync').create();
const uglify         = require('gulp-uglify-es').default;
const autoprefixer   = require('gulp-autoprefixer');
const avif           = require('gulp-avif');
const webp           = require('gulp-webp');
const imagemin       = require('gulp-imagemin');
const newer          = require('gulp-newer');
const clean          = require('gulp-clean');


function browsersync() {
  browserSync.init({
    server : {
      baseDir: 'app/'
    }
  });
}


function optimizeImages() {
  return src(['app/images/src/**/*.*', '!app/images/src/**/*.svg'])
          .pipe(newer('app/images'))
          .pipe(avif({quality : 50}))

          .pipe(src('app/images/src/**/*.*'))
          .pipe(newer('app/images'))
          .pipe(webp())

          .pipe(src('app/images/src/**/*.*'))
          .pipe(newer('app/images'))
          .pipe(imagemin())

          .pipe(dest('app/images'))
}

function scripts() {
  return src([
    'node_modules/jquery/dist/jquery.js',
    'node_modules/slick-carousel/slick/slick.js',
    'node_modules/mixitup/dist/mixitup.js',
    'app/js/main.js'
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}


function styles() {
  return src('app/scss/style.scss')
      .pipe(scss({outputStyle: 'compressed'}))
      .pipe(concat('style.min.css'))
      .pipe(autoprefixer({
        overrideBrowserslist: ['last 10 version'],
        grid: true
      }))
      .pipe(dest('app/css'))
      .pipe(browserSync.stream())
}

function cleanDist() {
  return src('dist')
  .pipe(clean())
}

function building() {
  return src([
    'app/css/style.min.css',
    'app/js/main.min.js',
    'app/images/**/*.*',
    '!app/images/src/**/*.*',
    'app/fonts/**/*',
    'app/*.html'
  ], {base: 'app'})
    .pipe(dest('dist'))
}

function watching() {
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
  watch(['app/images/**/*.*'], optimizeImages);
  watch(['app/*.html']).on('change', browserSync.reload);
}

exports.styles         = styles;
exports.watching       = watching;
exports.browsersync    = browsersync;
exports.scripts        = scripts;
exports.optimizeImages = optimizeImages;


exports.build = series(cleanDist, building);
exports.default = parallel(styles, scripts, optimizeImages,browsersync, watching);


