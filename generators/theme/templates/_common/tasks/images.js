/* eslint-env node, es6 */
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const {dir} = require('./helper/utils');

const $ = gulpLoadPlugins();

/**
 * Optimize svg images and create svg sprite
 */
const svgstore = () =>
  gulp
    .src(dir('template', 'frontend/_public/src/img/icons/**/*.svg'))
    .pipe(
      $.rename(path => {
        if (path.dirname !== '.') {
          path.basename = `${path.dirname}-${path.basename}`;
        }
      })
    )
    .pipe(
      $.imagemin([
        $.imagemin.svgo({
          plugins: [
            {removeViewBox: false},
            {removeUselessStrokeAndFill: false},
            {
              cleanupIDs: {
                prefix: {
                  toString() {
                    this.counter = this.counter || 0;

                    return `id-${this.counter++}`;
                  },
                },
              },
            },
          ],
        }),
      ])
    )
    .pipe($.svgstore())
    .pipe(gulp.dest(dir('tmp', 'frontend/_resources/img')))
    .pipe($.size({title: 'svgstore'}));

/**
 * Optimize images
 */
const imagemin = () =>
  gulp
    .src(dir('template', 'frontend/_public/src/img/**/*', '!frontend/_public/src/img/icons/**/*.svg'))
    .pipe($.imagemin())
    .pipe(gulp.dest(dir('tmp', 'frontend/_resources/img')))
    .pipe($.size({title: 'imagemin'}));

module.exports = {
  imagemin,
  svgstore,
};
