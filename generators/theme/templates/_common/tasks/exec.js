/* eslint-env node, es6 */
const execa = require('execa');
const {log} = require('gulp-util');
const {dir, fpmConsole} = require('./helper/utils');
const {ENV, getOption} = require('./helper/env');

/**
 * Dump theme config
 */
const swDumpConfig = () => {
  if (!getOption('php')) {
    return Promise.resolve();
  }
  if (getOption('docker')) {
    return fpmConsole('sw:theme:dump:configuration').catch(err => log('Error:', err));
  }

  return execa(dir('root', 'bin/console'), ['sw:theme:dump:configuration']);
};

/**
 * Compile theme and generate template cache
 */
const swCompileTheme = () => {
  if (!getOption('php')) {
    return Promise.resolve();
  }
  if (getOption('docker')) {
    return fpmConsole('sw:theme:cache:generate').catch(err => log('Error:', err));
  }

  return execa(dir('root', 'bin/console'), ['sw:theme:cache:generate']);
};

/**
 * Clear cache (use --env [node|dev|prod] for specific environment)
 */
const swCacheClear = () => {
  if (!getOption('php')) {
    return Promise.resolve();
  }
  if (getOption('docker')) {
    return fpmConsole(['sw:cache:clear', `--env=${ENV}`]).catch(err => log('Error:', err));
  }

  return execa(dir('root', 'bin/console'), ['sw:cache:clear', '--env', ENV]);
};

module.exports = {
  swDumpConfig,
  swCompileTheme,
  swCacheClear,
};
