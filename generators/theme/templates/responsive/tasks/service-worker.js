/* eslint-env node, es6 */
const path = require('path');
const gulp = require('gulp');
const swPrecache = require('sw-precache');
const pkg = require('../package.json');
const {dir, paths, swconfig} = require('./helper/utils');

/**
 * Copy over the scripts that are used in importScripts as part of the generate-service-worker task.
 */
const copySwScripts = () =>
  gulp.src(['node_modules/sw-toolbox/sw-toolbox.js', dir('src', 'js/sw/runtime-caching.js')])
    .pipe(gulp.dest(dir('prod', 'js/sw')));

/**
 * Generate a service worker file that will provide offline functionality for
 * local resources. This should only be done for the 'dist' directory, to allow
 * live reload to work as expected when serving from the 'app' directory.
 *
 * See http://www.html5rocks.com/en/tutorials/service-worker/introduction/ for
 * an in-depth explanation of what service workers are and why you should care.
 */
const generateServiceWorker = () => {
  const {lessTarget, jsTarget} = swconfig();
  const filepath = dir('root', 'service-worker.js');

  return swPrecache.write(filepath, {
    // Used to avoid cache conflicts when serving on localhost.
    cacheId: pkg.name,
    // Sw-toolbox.js needs to be listed first. It sets up methods used in runtime-caching.js.
    importScripts: [
      path.relative(paths.root, dir('prod', 'js/sw/sw-toolbox.js')),
      path.relative(paths.root, dir('prod', 'js/sw/runtime-caching.js'))
    ],
    staticFileGlobs: [
      // Add/remove glob patterns to match your directory setup.
      dir('prod', 'img/**/*'),
      dir('root', lessTarget),
      dir('root', jsTarget),
      dir('prod', 'js/vendor.js')
    ],
    // Translates a static file path to the relative URL that it's served from.
    stripPrefix: dir('root', path.sep)
  });
};

module.exports = {
  copySwScripts,
  generateServiceWorker
};
