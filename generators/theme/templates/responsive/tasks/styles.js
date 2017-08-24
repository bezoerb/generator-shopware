/* eslint-env node, es6 */
const gulp = require('gulp');
const os = require('os');
const fs = require('fs-extra');
const path = require('path');
const gulpLoadPlugins = require('gulp-load-plugins');
const {PluginError} = require('gulp-util');
const {dir, swconfig} = require('./helper/utils');
const {ENV} = require('./helper/env');

const autoprefixer = require('autoprefixer');

const $ = gulpLoadPlugins();
const PROD = ENV === 'prod';

const themeName = path.basename(path.join(__dirname, '..'));

const vendor = () => {
  const {less} = swconfig();
  const files = less.filter(file => !file.includes(`Frontend/${themeName}`));
  return [...new Set(files)].map(file => {
    // Fix broken symlinks
    if (fs.existsSync('/' + file)) {
      return '/' + file;
    }
    return dir('root', file);
  });
};

/**
 * Prepare less file with import statements to all required files
 * This file needs to be saved next to the final css to get correct paths as the shopware
 * backend compiles with the `relativeUrls` option set to true
 *
 * @param cb
 */
const prepareStyles = cb => {
  // Include shopware variables & mixins as well as own plugin- and theme files
  const files = [...new Set([
    dir('root', 'themes/Frontend/Bare/frontend/_public/src/less/variables.less'),
    dir('root', 'themes/Frontend/Bare/frontend/_public/src/less/mixins.less'),
    dir('root', 'themes/Frontend/Responsive/frontend/_public/src/less/variables.less'),
    dir('root', 'themes/Frontend/Responsive/frontend/_public/src/less/mixins.less'),
    dir('src', 'less/all.less')
  ])].map(file => `@import "${path.relative(dir('web', 'cache'), file)}";`);

  fs.outputFile(dir('web', 'cache/dev.less'), files.join(os.EOL), function () {
    const vendorstyles = vendor().map(file => `@import "${path.relative(dir('web', 'cache'), file)}";`);
    fs.outputFile(dir('web', 'cache/vendor.less'), vendorstyles.join(os.EOL), cb);
  });
};

/**
 * Less task
 *
 * @param reload browsersync reload method
 * @param cache
 */
const styles = (reload, cache = 0) => () => {
  const {config} = swconfig();

  const src = cache ? dir('web', 'cache/dev.less') : dir('web', 'cache/dev.less', 'cache/vendor.less');

  return gulp.src(src)
    .pipe($.sourcemaps.init())
    // Compile less files
    .pipe($.if('*.less', $.less({
      modifyVars: config,
      relativeUrls: true,
      paths: [path.join(__dirname, '..', 'node_modules')]
    }))).on('error', function (error) {
      const message = new PluginError('less', error.message).toString();
      process.stderr.write(message + '\n');
      this.emit('end');
    })
    // Store unminified in tmp directory for debugging purpose
    .pipe(gulp.dest('.tmp'))
    // Concatenate and minify styles
    .pipe($.if(PROD && '*.css', $.cssnano({safe: true, zindex: false})))
    // Add vendor prefixes
    .pipe($.postcss([
      autoprefixer({browsers: AUTOPREFIXER_BROWSERS})
    ]))
    .pipe($.rename('dev.css'))
    .pipe($.size({title: 'styles'}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(dir('web', 'cache')))
    .pipe(reload({
      stream: true,
      match: '**/*.css'
    }));
};

module.exports = {
  prepareStyles,
  styles
};
