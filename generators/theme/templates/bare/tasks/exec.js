/* eslint-env node, es6 */
const execa = require('execa');
const {log} = require('gulp-util');
const {dir} = require('./helper/utils');
const {ENV, getOption} = require('./helper/env');

/**
 * Dump theme config
 */
const swDumpConfig = () => {
  if (getOption('docker')) {
    // @todo Find a way to call shopware console inside the php container
    return Promise.resolve();
  }

  return execa(dir('root', 'bin/console'), ['sw:theme:dump:configuration']).then(result => log(result.stdout));
};

/**
 * Compile theme and generate template cache
 */
const swCompileTheme = () => {
  if (getOption('docker')) {
    // @todo Find a way to call shopware console inside the php container
    return Promise.resolve();
  }

  return execa(dir('root', 'bin/console'), ['sw:theme:cache:generate']);
};

/**
 * Clear cache (use --env [node|dev|prod] for specific environment)
 */
const swCacheClear = () => {
  if (getOption('docker')) {
    // @todo Find a way to call shopware console inside the php container
    return Promise.resolve();
  }

  return execa(dir('root', 'bin/console'), ['sw:cache:clear', '--env', ENV]);
};

module.exports = {
  swDumpConfig,
  swCompileTheme,
  swCacheClear,
};
