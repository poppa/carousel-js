/*
  Author: Pontus Östlund <https://profiles.google.com/poppanator>
*/
// jshint esversion: 6, node: true
'use strict';
const
  gulp    = require('gulp'),
  sass    = require('gulp-sass'),
  plumber = require('gulp-plumber'),
  newer   = require('gulp-newer'),
  babel   = require('gulp-babel');

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
    .pipe(gulp.dest('build'));
});

gulp.task('js', [], () => {
  return gulp.src('src/carousel.js')
    .pipe(plumber())
    .pipe(newer('build'))
    .pipe(babel())
    .pipe(gulp.dest('build'));
});

gulp.task('watch', [ 'default' ], () => {
  gulp.watch('src/**/*.scss', [ 'sass' ]);
  gulp.watch('src/carousel.js', [ 'js' ]);
});

gulp.task('default', [ 'sass', 'js' ]);
