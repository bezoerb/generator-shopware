/* eslint-env node, es6 */
const gulp = require('gulp');
const {dir} = require('./helper/utils');
const {Server} = require('karma');
const gulpLoadPlugins = require('gulp-load-plugins');

const $ = gulpLoadPlugins();

const karma = cb => {
  new Server(
    {
      configFile: dir('template', 'karma.conf.js'),
      singleRun: true,
    },
    code => {
      process.exit(code);
      cb();
    }
  ).start();
};

/**
 * Lint js files
 */
const lint = () =>
  gulp
    .src([
      '*.js',
      'tasks/**/*.js',
      ...dir('src', 'js/**/*.js', '!js/vendor/**/*', '!js/polyfills/**/*', '!js/legacy/**/*'),
    ])
    .pipe($.eslint({fix: true}))
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());

module.exports = {
  lint,
  karma,
};
