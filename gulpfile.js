/*
  Author: Pontus Östlund <https://profiles.google.com/poppanator>
*/
// jshint esversion: 6, node: true
'use strict';
const
  gulp       = require('gulp'),
  sass       = require('gulp-sass'),
  plumber    = require('gulp-plumber'),
  newer      = require('gulp-newer'),
  rename     = require('gulp-rename'),
  uglify     = require('gulp-uglify'),
  babel      = require('gulp-babel'),
  sourcemaps = require('gulp-sourcemaps');

const doCompress = true;

gulp.task('sass', () => {
  const sassOpts = {};

  if (doCompress) {
    sassOpts.outputStyle = 'compressed';
  }

  return gulp.src('src/**/*.scss')
    .pipe(plumber())
    .pipe(newer('build'))
    .pipe(sass(sassOpts).on('error', sass.logError))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('build'));
});

gulp.task('js', [], () => {
  return gulp.src('src/carousel.js')
    .pipe(plumber())
    .pipe(newer('build'))
    .pipe(sourcemaps.init())
      .pipe(babel({ presets: ['es2015'] }))
      .pipe(uglify())
      .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build'));
});

gulp.task('site-js', [], () => {
  return gulp.src([ 'site/src/*.js' ])
    .pipe(plumber())
    .pipe(newer('site/build'))
    .pipe(sourcemaps.init())
      .pipe(babel({ presets: ['es2015'] }))
      .pipe(uglify())
      .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('site/build'));
});

gulp.task('site-sass', () => {
  const sassOpts = {};

  if (doCompress) {
    sassOpts.outputStyle = 'compressed';
  }

  return gulp.src('site/src/*.scss')
    .pipe(plumber())
    .pipe(newer('site/build'))
    .pipe(sass(sassOpts).on('error', sass.logError))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('site/build'));
});


gulp.task('watch', [ 'default' ], () => {
  gulp.watch('src/**/*.scss', [ 'sass' ]);
  gulp.watch('src/carousel.js', [ 'js' ]);
  gulp.watch('site/src/*.js', [ 'site-js' ]);
  gulp.watch('site/src/*.scss', [ 'site-sass' ]);
});

gulp.task('default', [ 'sass', 'js', 'site-sass', 'site-js' ]);
