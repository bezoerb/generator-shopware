/* eslint-env node, es6 */
const ngrok = require('ngrok');
const chalk = require('chalk');
const {output: pageSpeed} = require('psi');
const {paths, swSetHost, phpMiddleware} = require('./helper/utils');
const {getOption} = require('./helper/env');
const browserSync = require('browser-sync');
const getport = require('getport');

let site = getOption('host');

/**
 * Open a secure tunnel to local browsersync server and store
 * the generated url in the 'site' variable
 * It's recommended to configure your local url in the environment to get
 * the benefits of gzip compression and browser caching from your local apache
 *
 * @param {Function} cb Callback function
 */
const ngrokUrl = cb => {
  const bs = browserSync.create('ngrok');
  const host = getOption('host') ? `http://${getOption('host')}` : undefined;
  const options = {
    watchTask: true,
    notify: false,
    open: false,
    ghostMode: false,
  };

  // Use browsersync as proxy to your local site if possible
  if (host) {
    options.proxy = host;
  } else {
    options.server = {baseDir: paths.root};
    options.middleware = [phpMiddleware('prod')];
  }

  // Find a free port, fire up browsersync and request the tunnel
  getport(8000, 8999, (err, port) => {
    if (err) {
      return cb(err);
    }
    bs.init({...options, port}, () => {
      ngrok.connect(port, (err, url) => {
        if (err) {
          return cb(err);
        }

        site = url;
        console.log('      Tunnel:', chalk.magenta(url));
        console.log('');

        let promise;
        if (host) {
          promise = swSetHost(getOption('host'));
        } else {
          promise = swSetHost(site.replace(/^.*:\/\//, ''));
        }

        promise.then(() => cb());
      });
    });
  });
};

/**
 * Run pagespeed insights with strategy: mobile
 */
const psiMobile = () =>
  pageSpeed(site, {
    strategy: 'mobile',
    nokey: 'true',
    threshold: 1,
  });

/**
 * Run pagespeed insights with strategy: desktop
 */
const psiDesktop = () =>
  pageSpeed(site, {
    strategy: 'desktop',
    nokey: 'true',
    threshold: 1,
  });

module.exports = {
  ngrokUrl,
  psiMobile,
  psiDesktop,
};
