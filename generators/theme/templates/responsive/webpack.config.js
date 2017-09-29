/* eslint-env node, es6 */
const path = require('path');
const fs = require('fs-extra');
const webpack = require('webpack');
const {paths, dir, swconfig} = require('./tasks/helper/utils');
const {ENV} = require('./tasks/helper/env');

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
 * Vendor js files (parent theme files)
 * @returns {Array<string>}
 */
function vendor() {
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
  'window.jQuery': 'jquery'
};

/**
 * Alias global jquery
 * @type {{jquery: string}}
 */
const aliases = {
  jquery: resolvePathFromConfig('jquery.min.js')
};

/**
 *
 */
const config = {
  context: jsRoot,
  resolve: {
    modules: [
      paths.root,
      __dirname,
      jsRoot,
      path.join(__dirname, 'tests'),
      'node_modules'
    ],
    alias: aliases
  },

  entry: {
    app: [...main(), './main.js']
  },

  output: {
    path: dir('template', 'frontend/_resources/js'),
    publicPath: '/web/cache/',
    filename: 'main.js'
  },

  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.ProvidePlugin(provide),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin()
  ],

  module: {
    rules: [
      {
        test: /jquery\.min\.js/,
        use: [{
          loader: 'expose-loader',
          options: 'jQuery'
        }, {
          loader: 'expose-loader',
          options: '$'
        }]
      },
      {
        test: /\.json$/,
        use: ['json-loader']
      }
    ]
  }
};

if (ENV === 'prod') {
  config.module.rules.push({
    test: /.js?$/,
    exclude: /(node_modules)|(Frontend\/Bare)|(Frontend\/Responsive)|(\/plugins\/)/,
    use: ['babel-loader?presets[]=env,cacheDirectory=true']
  });

  config.plugins.push(new webpack.optimize.UglifyJsPlugin());
} else {
  config.devtool = '#cheap-module-source-map';

  config.entry.vendor = vendor();

  config.output = {
    path: dir('root', '/web/cache'),
    publicPath: '/web/cache/',
    filename: 'dev.js'
  };

  config.module.rules.push({
    test: /.js?$/,
    exclude: /(node_modules)|(Frontend\/Bare)|(Frontend\/Responsive)|(\/plugins\/)/,
    use: [
      'babel-loader?presets[]=env,cacheDirectory=true'
    ]
  });

  config.plugins = [
    new webpack.optimize.CommonsChunkPlugin({name: 'vendor', filename: 'vendor.js'}),
    ...config.plugins
  ];
}

if (serve) {
  config.entry.app = [
    'webpack/hot/dev-server',
    'webpack-hot-middleware/client',
    ...config.entry.app
  ];

  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  config.module.rules[config.module.rules.length - 1].use.unshift('monkey-hot-loader');
}

module.exports = config;
