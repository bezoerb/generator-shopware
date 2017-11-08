/* eslint-env browser, es6 */
/**
 * Main theme js file
 */
const debug = require('debug')('bilder:core');

// Fix mobile touch styles
document.addEventListener('touchstart', function () {}, true);

debug('Initializing polyfills');
// As all supported browsers support html5 tags there's no need
// to add modernizr in the <HEAD> section of out page
require('./vendor/modernizr');
// Add SVG external content support to all browsers.
// Enables external SVG spritemaps <use xlink:href="icons.svg#myicon"/>
// Use smarty function "icon" {icon id="..." title="..."}
require('svg4everybody')();
// This adds support for object-fit and object-position to IEdge 9-13, Android < 5,
// Safari < 10 and skips browsers that already support them.
require('object-fit-images')();

require('./components');

// Initialize service worker
require('./sw');

debug('Theme "bilder" is initialized');
