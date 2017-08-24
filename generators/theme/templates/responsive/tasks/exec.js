/* eslint-env node, es6 */
const execa = require('execa');
const {log} = require('gulp-util');
const {dir} = require('./helper/utils');
const {ENV} = require('./helper/env');

/**
 * Dump theme config
 */
const swDumpConfig = () =>
  execa(dir('root', 'bin/console'), ['sw:theme:dump:configuration'])
    .then(result => log(result.stdout));

/**
 * Compile theme and generate template cache
 */
const swCompileTheme = () =>
  execa(dir('root', 'bin/console'), 'sw:theme:cache:generate');

/**
 * Clear cache (use --env [node|dev|prod] for specific environment)
 */
const swCacheClear = () =>
  execa(dir('root', 'bin/console'), ['sw:cache:clear', '--env', ENV]);

module.exports = {
  swDumpConfig,
  swCompileTheme,
  swCacheClear
};
