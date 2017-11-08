/* eslint-env node */
// Karma configuration
process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function (config) {
  var logDir = '';

  // remove common chunks plugins as this doesn't play well with karma
  const wpc = require('./webpack.config');
  wpc.plugins = wpc.plugins.filter(plugin => plugin.constructor.name !== 'CommonsChunkPlugin');

  config.set({

    // Base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    plugins: [
      require('karma-webpack'),
      'karma-mocha',
      'karma-chai',
      'karma-mocha-reporter',
      'karma-chrome-launcher',
      'karma-phantomjs-launcher',
    ],

    // Frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai'],

    // List of files / patterns to load in the browser
    files: [

      'tests/spec/*spec.js',
    ],

    preprocessors: {
      // Add webpack as preprocessor
      'tests/spec/*spec.js': ['webpack'],
    },

    webpack: wpc,

    webpackMiddleware: {
      noInfo: true,
    },

    // Test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha'],

    // Junit reporter
    junitReporter: {
      outputDir: logDir || '',
      suite: '',
    },

    // Web server port
    port: 9876,

    // Enable / disable colors in the output (reporters and logs)
    colors: true,

    test: {a: 1},
    // Level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // Start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeHeadless'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,
  });
};
