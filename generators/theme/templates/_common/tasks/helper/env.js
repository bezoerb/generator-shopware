/* eslint-env node, es6 */
const minimist = require('minimist');
const dotenv = require('dotenv');
const {join} = require('path');
const {existsSync} = require('fs');

const envFile = join(__dirname, '../../', '.env.template');
if (existsSync(envFile)) {
  dotenv.config({path: envFile});
}

const defaultOptions = {
  string: ['env', 'host', 'base', 'shop'],
  boolean: ['docker', 'php'],
  default: {
    env: process.env.env || process.env.SHOPWARE_ENV || process.env.NODE_ENV || 'dev',
    host: process.env.host || process.env.SHOPWARE_HOST,
    base: process.env.base,
    shop: process.env.shop || 1,
    docker: false,
    php: true,
    fpm: 'php:9000',
  },
};

const options = minimist(process.argv.slice(2), defaultOptions);

const getOption = (key, defaultValue) => (options[key] !== undefined && options[key]) || defaultValue;

const isProd = () => ['prod', 'production'].includes(getOption('env').toLowerCase()) || process.argv.includes('-p');

module.exports = {
  getOption,
  isProd,
  isDev: () => !isProd(),
  ENV: getOption('env'),
  base: getOption('base'),
  shop: getOption('shop'),
};
