/* eslint-env browser, es6 */
/**
 * Main theme js file
 */
// fix mobile touch styles
document.addEventListener('touchstart', function () {}, true);

// Add SVG external content support to all browsers.
// Enables external SVG spritemaps <use xlink:href="icons.svg#myicon"/>
// Use smarty function "icon" {icon id="..." title="..."}
require('svg4everybody')();
// This adds support for object-fit and object-position to IEdge 9-13, Android < 5,
// Safari < 10 and skips browsers that already support them.
require('object-fit-images')();

// initialize service worker
require('./sw');

const debug = require('debug')('<%= themename %>:core');
debug('Theme "<%= themename %>" is initialized');
