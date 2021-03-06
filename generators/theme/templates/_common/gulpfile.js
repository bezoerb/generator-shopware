'use strict';
/* eslint-env node, es6 */
// This gulpfile makes use of new JavaScript features.
// Babel handles this without us having to do anything. It just works.
// You can read more about the new JavaScript features here:
// https://babeljs.io/docs/learn-es2015/
const gulp = require('gulp');
const del = require('del');
const watch = require('gulp-watch');
const batch = require('gulp-batch');
const runSequence = require('run-sequence');
const {isProd, getOption} = require('./tasks/helper/env');
const {dir, swSetHost} = require('./tasks/helper/utils');

// Require the tasks
const {serve, bs} = require('./tasks/server');
const {rev, revManifest} = require('./tasks/rev');
const {prepareStyles, styles} = require('./tasks/styles');
const {scripts} = require('./tasks/scripts');
const {svgstore, imagemin} = require('./tasks/images');
const {lint, karma} = require('./tasks/tests');
const {swDumpConfig, swCompileTheme, swCacheClear} = require('./tasks/exec');
const {copySwScripts, generateServiceWorker} = require('./tasks/service-worker');
const {ngrokUrl, psiMobile, psiDesktop} = require('./tasks/psi');

// Shopware: Dump theme config
gulp.task('sw:config', swDumpConfig);
// Shopware: Compile theme and generate template cache
gulp.task('sw:compile', swCompileTheme);
// Shopware: Clear cache (use --env [node|dev|prod] for specific environment)
gulp.task('sw:cl', swCacheClear);

// Copy over the scripts that are used in importScripts as part of the
// generate-service-worker task.
gulp.task('copy-sw-scripts', copySwScripts);
// // Generate a service worker file that will provide offline functionality for
// local resources. This should only be done for the document root, to allow
// live reload to work as expected when serving from the 'frontend/_public/src' directory.
// activated in frontend/public/src/js/sw/index.js
// See http://www.html5rocks.com/en/tutorials/service-worker/introduction/ for
// an in-depth explanation of what service workers are and why we should care.
gulp.task('generate-service-worker', ['copy-sw-scripts'], generateServiceWorker);

// Prepare less file with import statements to all required less files
// including less files from theme config and the all.less file from this theme.
// CSS processing via gulp is DEV-only
gulp.task('styles:prepare', ['sw:config'], prepareStyles);
// Compile and automatically prefix stylesheets
gulp.task('styles', ['sw:config', 'styles:prepare'], styles(bs.reload));
// Just rebuild theme files on change
gulp.task('styles:watch', styles(bs.reload, true));

// Process scripts with webpack based on environment
// node environment (used in browsersync server) enables HMR (Hot Module Replacement)
gulp.task('scripts', ['sw:config'], scripts());

// Hash asset filenames and create app/config/rev-manifest.json
// The manifest file is used by zoerb/filerevbundle to append hashes
// in TWIG using the {{ asset(...) }} function
gulp.task('rev:files', rev);
gulp.task('rev', ['rev:files'], revManifest);

// Open a secure tunnel to localhost to let pagespeed insights analyse the page
gulp.task('ngrok:url', ngrokUrl);
// Run PageSpeed Insights for desktop
gulp.task('psi:desktop', psiDesktop);
// Run PageSpeed Insights for mobile
gulp.task('psi:mobile', psiMobile);
// Force exit and reset host
gulp.task('psi:exit', () => {
  swSetHost.sync(getOption('host'));
  process.exit();
});
gulp.task('psi', ['assets'], cb => {
  runSequence('ngrok:url', 'psi:mobile', 'psi:desktop', 'psi:exit', cb);
});

// Lint js files using eslint
gulp.task('lint', lint);
gulp.task('karma', karma);
gulp.task('test', cb => runSequence(['lint', 'karma'], cb));

// Automatically create svg sprite from svg icons in frontend/public/src/img/icons/**/*.svg
gulp.task('svgstore', svgstore);
// Optimize images
gulp.task('imagemin', imagemin);
gulp.task('images', cb => runSequence(isProd() ? ['svgstore', 'imagemin'] : ['svgstore'], cb));
gulp.task('images:watch', ['images'], done => {
  bs.reload();
  done();
});

// Clean output directory
gulp.task('clean', () =>
  del(['.tmp', dir('web', 'cache/*.{css,less,js,map}')], {dot: true, force: true}));

// Prepare assets for browsersync serve
gulp.task('serve:prepare', ['clean'], cb => {
  if (isProd()) {
    runSequence(['clean', 'test', 'assets'], cb);
  } else {
    runSequence(['clean', 'scripts', 'styles', 'images'], cb);
  }
});

// Run dev server and watch files
gulp.task('serve', ['serve:prepare'], serve(done => {
  // Use polling in docker environment
  const watchOpts = {
    usePolling: getOption('docker'),
    interval: 500,
    alwaysStat: true,
  };

  watch(dir('src', '**/*.{jpg,jpeg,gif,png,webp,svg}'), watchOpts, batch((e, done) => {
    gulp.start('images:watch', done);
  }));
  watch(dir('template', '{documents,frontend,newsletter,widgets}/**/*.tpl'), watchOpts).on('change', bs.reload);
  watch(dir('src', '**/*.less'), watchOpts, batch((e, done) => {
    gulp.start('styles:watch', done);
  }));
  done();
}));

// Optimize assets for prod environment
gulp.task('assets', ['sw:config', 'images', 'scripts'], cb =>
  runSequence('rev', 'sw:compile', 'generate-service-worker', cb));

// Build task. Run tests and optimize assets
gulp.task('build', ['clean'], cb => {
  runSequence(['assets'], 'test', cb);
});

// Default task: serve
gulp.task('default', ['serve']);
