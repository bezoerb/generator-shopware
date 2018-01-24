/* eslint-env node, es6 */
const path = require('path');
const fs = require('fs-extra');
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');
const {dir, swconfig} = require('./tasks/helper/utils');
const {isProd} = require('./tasks/helper/env');

const serve = process.argv.includes('serve');

/**
 * Theme name
 * @type {string}
 */
const themeName = path.basename(__dirname);

/**
 * Javascript root
 * @type {string}
 */
const jsRoot = dir('template', 'frontend/_public/src/js');

/**
 * Locate filepath in parent theme via theme config
 * @param componentPath
 * @returns {string}
 */
const resolvePathFromConfig = componentPath => {
  const {js} = swconfig();
  const file = js.find(file => file.includes(componentPath));

  return file && dir('root', file);
};

/**
 * Locate filepath in node_modules
 * @param componentPath
 */
const resolveNpmPath = componentPath => path.resolve(path.join(__dirname, 'node_modules', componentPath));

/**
 * Main theme js files
 * @returns {Array<string>}
 */
const main = () => {
  const {js} = swconfig();
  const files = js.filter(file => file.includes(`Frontend/${themeName}/frontend/_public/src`));
  return [...new Set(files)].map(file => {
    // Fix broken symlinks
    if (fs.existsSync('/' + file)) {
      return '/' + file;
    }
    return dir('root', file);
  });
};

/**
 * Swag js files (parent theme files)
 * @returns {Array<string>}
 */
function swagJs() {
  const {js} = swconfig();
  const files = js.filter(file => !file.includes(`Frontend/${themeName}`));
  return [...new Set(files)].map(file => {
    // Fix broken symlinks
    if (fs.existsSync('/' + file)) {
      return '/' + file;
    }
    return dir('root', file);
  });
}

/**
 * Provide global jquery to modules
 * @type {{$: string, jQuery: string, [window.jQuery]: string}}
 */
const provide = {
  $: 'jquery',
  jQuery: 'jquery',
  'window.jQuery': 'jquery',
};

/**
 * Alias global jquery
 * @type {{jquery: string}}
 */
const aliases = {
  jquery: resolvePathFromConfig('jquery.min.js') || resolveNpmPath('jquery'),
  hyperform: resolveNpmPath('hyperform/dist/hyperform.cjs.js'),
  Responsive: dir('root', 'themes/Frontend/Responsive/frontend/_public/src/js'),
};

/**
 *
 */
const config = {
  context: jsRoot,
  resolve: {
    modules: [
      jsRoot,
      path.join(__dirname, 'tests'),
      'node_modules',
    ],
    alias: aliases,
  },

  entry: {
    main: [...main(), './main.js'],
    vendor: [
      'jquery',
      'wicg-inert',
      'picturefill',
      'hyperform',
      'svg4everybody',
      path.join(aliases.Responsive, 'jquery.plugin-base.js'),
      path.join(aliases.Responsive, 'jquery.state-manager.js'),
      path.join(aliases.Responsive, 'jquery.storage-manager.js'),
    ],
  },

  output: {
    path: dir('template', 'frontend/_resources/js'),
    publicPath: '/web/cache/',
    filename: 'main.js',
  },

  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.ProvidePlugin(provide),

    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
  ],

  module: {
    rules: [
      {
        test: /jquery(\.min)?\.js/,
        use: [{
          loader: 'expose-loader',
          options: 'jQuery',
        }, {
          loader: 'expose-loader',
          options: '$',
        }],
      },
      {
        test: /\.json$/,
        use: ['json-loader'],
      },
    ],
  },
};

if (isProd()) {
  config.module.rules.push({
    test: /.js?$/,
    exclude: /(node_modules)|(Frontend\/Bare)|(Frontend\/Responsive)|(\/plugins\/)/,
    use: ['babel-loader?presets[]=env,cacheDirectory=true'],
  });

  config.plugins.push(new webpack.optimize.CommonsChunkPlugin({names: [ 'vendor'], filename: '[name]-[hash].js', minChunks: Infinity}));
  config.plugins.push(new webpack.optimize.UglifyJsPlugin());
  config.plugins.push(new webpack.DefinePlugin({NODE_ENV: 'production'}));

  config.plugins.push(new ManifestPlugin({
    fileName: '../rev-manifest.json',
    basePath: 'frontend/_resources/js/',
  }));

} else {
  config.devtool = '#cheap-module-source-map';

  config.output = {
    path: dir('root', '/web/cache'),
    publicPath: '/web/cache/',
    filename: 'dev.js',
  };

  // Add dynamic scripts from shopware which shopware adds to the main file in production mode
  // e.g. plugin js etc.
  const swag = swagJs();
  if (swag.length) {
    config.entry.swag = swag;
  } else {
    fs.outputFile(dir('root', '/web/cache/swag.js'), '/* No custom shopware script files */');
  }

  config.module.rules.push({
    test: /.js?$/,
    exclude: /(node_modules)|(Frontend\/Bare)|(Frontend\/Responsive)|(\/plugins\/)/,
    use: [
      'babel-loader?presets[]=env,cacheDirectory=true',
    ],
  });

  config.plugins.push(new webpack.optimize.CommonsChunkPlugin({names: [ 'vendor'], filename: '[name].js', minChunks: Infinity}));
}

if (serve) {
  config.entry.main = [
    'webpack/hot/dev-server',
    'webpack-hot-middleware/client',
    ...config.entry.main,
  ];

  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  config.module.rules[config.module.rules.length - 1].use.unshift('monkey-hot-loader');
}

module.exports = config;
