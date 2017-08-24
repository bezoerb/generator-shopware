/* eslint-env node */
// Karma configuration
module.exports = function (config) {
  var logDir = '';

  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    plugins: [
      require('karma-webpack'),
      'karma-mocha',
      'karma-chai',
      'karma-mocha-reporter',
      'karma-phantomjs-launcher'
    ],

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai'],

    // list of files / patterns to load in the browser
    files: [
      {pattern: '../Responsive/frontend/_public/vendors/js/jquery/jquery.min.js', watched: false},
      '../Responsive/frontend/_public/src/js/jquery.plugin-base.js',
      'tests/spec/*spec.js'
    ],

    preprocessors: {
      // Add webpack as preprocessor
      'tests/spec/*spec.js': ['webpack']
    },

    webpack: require('./webpack.config'),

    webpackMiddleware: {
      noInfo: true
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha'],

    // junit reporter
    junitReporter: {
      outputDir: logDir || '',
      suite: ''
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });
};
