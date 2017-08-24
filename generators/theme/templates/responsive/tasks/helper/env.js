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
  string: ['env', 'host'],
  default: {
    env: process.env.env || process.env.SHOPWARE_ENV || 'dev',
    host: process.env.host || process.env.SHOPWARE_HOST,
    swdir: process.env.swdir,
    shop: process.env.shop || 1
  }
};

const options = minimist(process.argv.slice(2), defaultOptions);

const getenv = (key, defaultValue) => (options[key] !== undefined && options[key]) || defaultValue;

module.exports.getenv = getenv;
module.exports.ENV = getenv('env');
module.exports.swdir = getenv('swdir');
module.exports.shop = getenv('shop');
