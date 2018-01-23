/* eslint-env node, es6 */
const os = require('os');
const parseurl = require('parseurl');
const fs = require('fs-extra');
const path = require('path');
const php = require('php-proxy-middleware');
const phpFpm = require('php-fpm');
const {flatten, first, last, find} = require('lodash');
const fastCgi = require('fastcgi-client');
const findUp = require('find-up');
const globby = require('globby');
const spawn = require('cross-spawn');
const chalk = require('chalk');
const execa = require('execa');
const {ENV, base, shop, getOption, isProd} = require('./env');
const pkg = require('../../package.json');

/**
 * Try to find shopware base directory
 * first try parents and fallback to git root + find
 *
 * @returns {string}
 */
const shopwareBase = () => {
  const file = 'shopware.php';
  const up = findUp.sync(file);

  if (up) {
    return path.dirname(up);
  }

  const cmd = spawn.sync('git', ['rev-parse', '--show-toplevel']);
  const basePath = base || (cmd.status === 0 && cmd.stdout.toString().trim()) || process.cwd();
  const matches = globby.sync([file, `*/${file}`], {cwd: basePath});

  if (matches.length && fs.existsSync(path.join(basePath, matches[0]))) {
    return path.dirname(path.join(basePath, matches[0]));
  }

  console.log(chalk.red('Error: could not resolve shopware directory'));
  process.exit(1);
};

// Setup Paths
const root = base || shopwareBase() || process.cwd();
const template = path.join(root, 'themes/Frontend', last(__dirname.match(/([^/]+)\/tasks\/helper/)) || pkg.name);
const src = path.join(template, 'frontend/_public/src');
const prod = path.join(template, 'frontend/_resources');
const tmp = path.join(template, '.tmp');
const web = path.join(root, 'web');
const paths = {root, template, web, prod, src, tmp};

// Ensure theme is symlinked
if (!fs.existsSync(template)) {
  if (!fs.existsSync(path.dirname(template))) {
    throw new Error('Missing shopware frontend themes directory ' + path.dirname(template));
  }

  const src = path.join(__dirname, '../..');
  const cwd = process.cwd();
  process.chdir(path.dirname(template));
  fs.ensureSymlinkSync(path.relative(path.dirname(template), src), template);
  process.chdir(cwd);
}

/**
 * Helper to get the current host ip
 * Returns 127.0.0.1 as fallback if no external ip is available
 *
 * @returns {string}
 */
const getHost = () => {
  const ifaces = os.networkInterfaces();
  let address = '127.0.0.1';
  Object.keys(ifaces).forEach(ifname => {
    ifaces[ifname].some(iface => {
      if (iface.family !== 'IPv4' || iface.internal !== false) {
        // Skips over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return false;
      }

      address = iface.address;
      return true;
    });
  });

  return address;
};

/**
 * Create php middleware
 */
const getMiddleware = env => {
  if (env === 'prod') {
    process.env.SHOPWARE_ENV = 'production';
    process.env.SHOPWARE_DEBUG = 0;
  } else {
    process.env.SHOPWARE_ENV = 'node';
    process.env.SHOPWARE_DEBUG = 0;
  }

  if (getOption('docker')) {
    const [host, port] = getOption('fpm').split(':');

    return phpFpm(
      {
        root: paths.root,
        host: host || 'php',
        port: port || 9000,
      },
      {
        script: '/project/shopware/shopware.php',
      }
    );
  }

  return php({
    address: '127.0.0.1', // Which interface to bind to
    // eslint-disable-next-line camelcase
    ini: {max_execution_time: 60, variables_order: 'EGPCS'},
    root: paths.root,
    router: path.join(paths.root, 'shopware.php'),
  });
};

/**
 * Fire up php middleware
 * @returns {Function}
 */
function phpMiddleware(env = ENV) {
  const middleware = getMiddleware(env);

  let base = [paths.root];
  if (!isProd()) {
    base = [paths.tmp, dir('tmp', 'frontend/_resources'), paths.src, paths.root];
  }

  // Helper function to check if file exists
  const exists = pathname =>
    find(base, root => {
      const file = path.join(root, pathname);
      return fs.existsSync(file) && fs.statSync(file).isFile();
    }) !== undefined;

  return function(req, res, next) {
    const {pathname} = parseurl(req);

    if (/^\/browser-sync\//.test(pathname) || /^\/__webpack_hmr$/.test(pathname) || exists(pathname)) {
      next();
    } else {
      middleware(req, res, next);
    }
  };
}

/**
 * Directory helper
 *
 * @param source
 * @param rest
 * @returns {*}
 */
function dir(source, ...rest) {
  if (!rest.length) {
    return paths[source] || source;
  }

  const dirs = flatten(rest).map(dir => {
    const match = dir.match(/^(!+)(.*)$/);
    if (match) {
      const file = path.join(paths[source] || source, match[2]);
      return `${match[1]}${file}`;
    }

    return path.join(paths[source] || source, dir);
  });

  return dirs.length === 1 ? first(dirs) : dirs;
}

/**
 * Parse shopware theme configuration
 * @returns {*}
 */
const swconfig = () => {
  const configFile = dir('web', `cache/config_${shop}.json`);
  if (!fs.existsSync(configFile)) {
    console.log(`Missing config file. Run ${chalk.green('gulp sw:config')}`);
    process.exit(1);
  }
  return fs.readJsonSync(dir('web', `cache/config_${shop}.json`), {throws: false});
};

const fpmConsole = cmd => {
  const [host, port] = getOption('fpm').split(':');

  const fpm = new Promise((resolve, reject) => {
    const loader = fastCgi({
      host: host || 'php',
      port: port || 9000,
    });
    loader.on('ready', () => resolve(loader));
    loader.on('error', reject);
  });

  return fpm.then(
    php =>
      new Promise((resolve, reject) => {
        php.request(
          {
            REQUEST_METHOD: 'GET',
            SCRIPT_FILENAME: '/project/bin/fcgi-console.php',
            QUERY_STRING: JSON.stringify(cmd),
          },
          (err, request) => {
            if (err) {
              return reject(err);
            }

            let output = '';
            let errors = '';

            request.stdout.on('data', function(data) {
              output += data.toString('utf8');
            });

            request.stderr.on('data', function(data) {
              errors += data.toString('utf8');
            });

            request.stdout.on('end', function() {
              if (errors) {
                reject(new Error(errors));
              }

              resolve(output);
            });
          }
        );
      })
  );
};

/**
 * As shopware only allows one host we need to set the current host
 * @param cmd
 * @param host
 * @param port
 * @returns {*}
 */
const setHost = (cmd, host, port) => {
  if (getOption('docker')) {
    if (host && port) {
      return fpmConsole(['sw:database:setup', '--steps', 'setupShop', `--host=${host}:${port}`]);
    }
    if (host) {
      return fpmConsole(['sw:database:setup', '--steps', 'setupShop', `--host=${host}`]);
    }
  }

  host = (host || '').replace(/^.*:\/\//, '');
  const args = [dir('root', 'bin/console'), 'sw:database:setup', '--steps', 'setupShop'];

  if (host && port) {
    return cmd('php', [...args, `--host=${host}:${port}`]);
  }

  if (host) {
    return cmd('php', [...args, `--host=${host}`]);
  }

  return false;
};

/**
 * Sync and async host setter
 * @param host
 * @param port
 */
const swSetHost = (host, port) => setHost(execa, host, port);
swSetHost.sync = (host, port) => setHost(execa.sync, host, port);

module.exports = {
  swconfig,
  swSetHost,
  dir,
  phpMiddleware,
  getHost,
  fpmConsole,
  paths,
};
