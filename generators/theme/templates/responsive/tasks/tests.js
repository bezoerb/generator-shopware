/* eslint-env node, es6 */
const gulp = require('gulp');
const {dir} = require('./helper/utils');
const gulpLoadPlugins = require('gulp-load-plugins');

const $ = gulpLoadPlugins();

/**
 * Lint js files
 */
const lint = () =>
  gulp.src([
    '*.js',
    'tasks/**/*.js',
    ...dir('src', 'js/**/*.js', '!js/vendor/**/*', '!js/polyfills/**/*', '!js/legacy/**/*')
  ])
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());

module.exports = {
  lint
};
