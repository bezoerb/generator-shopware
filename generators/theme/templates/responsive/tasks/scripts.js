/* eslint-env node, es6 */
import webpack from 'webpack';
import gutil from 'gulp-util';
import {ENV} from './helper/env';

/**
 * Concatenate and minify JavaScript.
 */
const scripts = () => cb => {
  const wpc = require('../webpack.config.js');
  const config = {
    ...wpc, stats: /* isDev && */ {
      // Configure the console output
      colors: true,
      modules: true,
      reasons: true,
      errorDetails: true
    }
  };

  webpack(config, (err, stats) => {
    if (err) {
      throw new gutil.PluginError('webpack:build', err);
    }
    if (ENV !== 'prod') {
      gutil.log('[webpack:build]', stats.toString({
        colors: true
      }));
    }
    cb();
  });
};

module.exports = {
  scripts
};
