/* eslint-env node, es6 */
const browserSync = require('browser-sync');
const {phpMiddleware, paths, dir, getHost, swSetHost} = require('./helper/utils');
const {ENV, getOption} = require('./helper/env');
const getport = require('getport');
const opn = require('opn');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const pkg = require('../package.json');

const nodeEnv = ENV !== 'prod';

/**
 * Browsersync config based on env
 */
const options = {
  server: {
    baseDir: nodeEnv ? [paths.tmp, dir('tmp', 'frontend/_resources'), paths.src, paths.root] : paths.root,
  },
  watchTask: nodeEnv,
  notify: nodeEnv,
  host: getHost(),
  open: false,
  ghostMode: {
    clicks: true,
    scroll: true,
    links: true,
    forms: true,
  },
};

/**
 * Browsersync instance
 */
const bs = browserSync.create(pkg.name || 'shopware');

/**
 * Serve task based on environment
 * @param cb
 */
const serve = cb => done => {
  const config = require('../webpack.config.js');
  const bundler = webpack(config);
  const middleware = [
    webpackDevMiddleware(bundler, {
      publicPath: config.output.publicPath,
      stats: {colors: true},
    }),
    webpackHotMiddleware(bundler),
  ];

  // Get free port and fire up browsersync
  getport(8000, 8999, (err, port) => {
    if (err) {
      return cb(err);
    }

    const exit = bs.exit;
    bs.init({...options, port, middleware: [...middleware, phpMiddleware()]}, (err, bs) => {
      if (err) {
        return cb(err);
      }

      // Stop browsersync and reset shopware host configuration on exit
      process.on('SIGINT', () => {
        exit();
        swSetHost.sync(getOption('host'));
        process.exit(0);
      });

      // Set shopware host configuration to browsersync server address
      swSetHost(bs.getOption('host'), bs.getOption('port')).then(() => {
        opn('http://' + bs.getOption('host') + ':' + bs.getOption('port'));
        if (cb) {
          cb(done);
        }
      });
    });
  });
};

module.exports = {
  bs,
  serve,
};
