// @ts-check
/*
  Author: Pontus Östlund <https://github.com/poppa>

  NOTE: You need to `npm i -g gulp-cli`, if not already done, for this to run.
*/
const gulp = require('gulp'),
  sass = require('gulp-sass')(require('sass')),
  plumber = require('gulp-plumber'),
  newer = require('gulp-newer'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify'),
  babel = require('gulp-babel'),
  sourcemaps = require('gulp-sourcemaps')

const doCompress = true

/** @typedef {Parameters<typeof import('gulp-sass')>[0]} GulpSassOptions */

/**
 * @param {string} src
 * @param {string} dest
 */
const sassFuncLow = (src, dest) => {
  /** @type GulpSassOptions */
  const sassOpts = {}

  if (doCompress) {
    sassOpts.outputStyle = 'compressed'
  }

  return () => {
    return gulp
      .src(src)
      .pipe(plumber())
      .pipe(newer('build'))
      .pipe(sass(sassOpts))
      .pipe(rename({ suffix: '.min' }))
      .pipe(gulp.dest(dest))
  }
}

/**
 * @param {string} src
 * @param {string} dest
 */
const jsFuncLow = (src, dest) => {
  return () => {
    return gulp
      .src(src)
      .pipe(plumber())
      .pipe(newer('build'))
      .pipe(sourcemaps.init())
      .pipe(babel({ presets: ['@babel/preset-env'] }))
      .pipe(uglify())
      .pipe(rename({ suffix: '.min' }))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(dest))
  }
}

const watchFunc = () => {
  gulp.watch('src/**/*.scss', gulp.task('sass'))
  gulp.watch('src/carousel.js', gulp.task('js'))
  gulp.watch('site/src/*.js', gulp.task('site-js'))
  gulp.watch('site/src/*.scss', gulp.task('site-sass'))
}

const sassFunc = sassFuncLow('src/**/*.scss', 'build')
const siteSassFunc = sassFuncLow('site/src/*.scss', 'site/build')
const jsFunc = jsFuncLow('src/carousel.js', 'build')
const siteJsFunc = jsFuncLow('site/src/*.js', 'site/build')

gulp.task('sass', sassFunc)
gulp.task('site-sass', siteSassFunc)
gulp.task('js', jsFunc)
gulp.task('site-js', siteJsFunc)
gulp.task('watch', watchFunc)

/** @type Array<import('undertaker').TaskFunctionWrapped | undefined> */
const allFuncs = [
  gulp.task('sass'),
  gulp.task('site-sass'),
  gulp.task('js'),
  gulp.task('site-js'),
]

// @ts-ignore
gulp.task('watch', gulp.parallel(...allFuncs.concat(gulp.task('watch'))))
// @ts-ignore
gulp.task('default', gulp.parallel(allFuncs))
