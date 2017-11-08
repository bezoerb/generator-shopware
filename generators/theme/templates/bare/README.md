Shopware 5 theme
======================
This document describes the structure and the usage of the **bilder.de** theme

Description
-----------
**BilderDe** is a childtheme of the Shopware 5 Bare theme with some manually
pulled in features from the default Responsive theme which are required . Like the default
theme it is based on Smarty 3, HTML5 and CSS3 using the LESS processor.

Additionally third-party web components can be easily added using `npm`.

Feature / technologies
----------------------
* Build system based on [gulp](http://gulpjs.com) and [webpack](https://webpack.js.org/)
* Browsersync dev server
* Javascripbt bundling with [webpack](https://webpack.github.io/) including [HMR](https://github.com/webpack/docs/wiki/hot-module-replacement-with-webpack)
* SVG spritesheets for icons
* Offline support with [service workers](http://www.html5rocks.com/en/tutorials/service-worker/introduction/)

Requirements
------------
The requirements for theme development are:
* Node >= 6.4
* Gulp 3.x
* PHP >= 5.6


Usage
-----
Using the theme is as easy as selecting it in the Theme-Manager module and you're ready to go. 

Getting started
---------------

Use the command line to navigate to the theme directory. 
Run `npm i` to install the dependencies.
Afterwards you can run 

`npm start` to start the development server<br/>
`npm test` to run tests<br/>
`npm run build` to start the build process


Build System
------------
The theme setup is based on `gulp`. The following tasks are available. You can run the tasks by calling the following command in the theme root directory:
`gulp <task>`

| Task             | Description            
| ---------------- | -----------
| test             | Run tests             
| psi              | Run Pagespeed Insights
| serve            | Run Browsersync dev server
| assets           | Prepare production assets which will be picked up by `sw:theme:cache:generate`
| build            | Run tests and build assets

There are more tasks defined for internal use. See `gulpfile.js` for deeper insights. 




#### Environment
We have three different environments available which can be triggered by appending `--env <ENV>` to your gulp tasks.
E.g. `gulp serve --env prod`

| Environment | Description            
| ----------- | -----------
| prod        | Run shopware in production environment   
| dev         | Run Shopware in development environment
| node        | Default environment when running the BrowserSync dev Server. This environment enables Hot Module Replacement and style injection for development.

#### Environment file
The environment variables can be stored in an `.env` file inside the theme root folder. This file is ignored in the git repository.
Due to the lack in shopware to allow multiple hosts for one site it is recommended to set the host in your environment as this setting is overwritten when running `gulp serve` to allow accessing the page under the IP adress provided by Browsersync.
When the host configuration is present in the environment, the shopware host is set to this value after browsersync quits.

Example `.env` file
```
host=bilder.localhost
```

Development
-----------

#### Filestructure

```
BilderDe
 ├── _private
 |   ├── smarty                 // Custom smarty functions
 |   └── snippets               // Theme specific text snippets
 |
 ├── _frontend
 │   ├── _public                // SOURCE files
 │   │   ├── src
 │   │   │   ├── css            // Currently unused (Can be included in the build step for 3rd party styles)
 │   │   │   ├── fonts          // Webfonts
 │   │   │   ├── img            // Theme specific images
 │   │   │   │   ├── icons      // SVG Icons  
 │   │   │   │   └── ...
 │   │   │   ├── js             // Javascript source files
 │   │   │   └── less           // Less css files
 │   │   └── service-worker.js  // Empty service worker file.
 │   │
 │   ├── _resources             // PRODUCTION files
 │   │   ├── img                // Optimized images
 │   │   │   ├── icons.svg      // SVG sprite
 │   │   │   └── ...
 │   │   └── js                 // Minified theme js referenced in Theme.php
 │   │
 │   └── ...                    // Smarty template folders/files
 │
 ├── tasks                      // Gulp tasks
 │   └── ...
 ├── tests                      // Integration tests
 │   └── ...
 ├── gulpfile.js                // Gulp configuration file
 ├── webpack.config.js          // Webpack configuration for js bundling
 ├── karma.conf.js              // Unittest configuration
 ├── .babelrc                   // Enable ES2016 for Gulp configuration
 ├── .editorconfig              // Basic code styles: http://editorconfig.org
 ├── .eslintrc                  // Configuration for JS linter
 ├── .jscsrc                    // Configuration for JS linter (Can be imported to PhpStorm)
 ├── .stylelintrc               // Configuration for CSS linter
 ├── .env                       // Environment configuration file
 └── Theme.php                  // Theme configuration file

```

#### Javascript
Shopware uses it's own basic javascript compressor which strips whitespace and concatenates all javscript files provided by Theme and plugins.
To allow modular Javascript development on the one hand and meeting the shopware requirements on the other hand, the theme javascript is bundled in two separate files.
When developing with browsersync, all javascript changes are hot swapped without the need to reload the page.

| File      | Description
| --------- | -----------
| vendor.js | This file includes jquery as well as some globally required shopware core javascript files like e.g. `jquery.plugin.base`<br>**This file is referenced directly in `index/index.tpl` as it needs to be loaded before all other scripts**
| main.js   | Theme script bundled with `frontend/_public/src/js/main.js` as main entry point.

All theme javascript files are parsed with [babel](https://babeljs.io/) so it's possible to write ES6.

###### Javsacript structure

```
js
 ├── main.js         // Main entry point
 ├── components      // Mainly jQuery plugins
 │   ├── index.js    // Main component file requiring all needed components
 │   └── legacy      // Shopware (responsive) jquery plugins
 │       └── ...
 ├── modules         // All non-jquery scripts required by the theme
 │   ├── index.js    // Main module file requiring all needed modules
 │   ├── utils.js    // Some helper funktions  
 │   └── ...
 ├── polyfills       // Polyfills like requestAnimationFrame
 │   └── ...
 ├── sw              // Service worker specific files
 │   └── ...
 └── vendors         // Vendor scripts which can not be installed with npm
     └── ...
```


#### CSS
Shopware 5 uses it's own less compiler to build the production css. This compiler bundles all less files (Plugins as well as the `all.less` file defined in the theme)
As this is doesn't play well with the style injection feature of browsersync, we simulate this behavior for development to get a better developer experience.

This theme follows Inverted Triangle CSS (ITCSS) by Harry Roberts.
Files should be organized in groups from:
 * Generic to explicit
 * Far-reaching to localised
 * Low specificity to high specificity

###### CSS structure
```
less
 ├── settings   // Global variables, site-wide settings, config switches, etc.
 │   └── ...
 ├── tools      // Site-wide mixins and functions.
 │   └── ...
 ├── generic    // Low-specificity, far-reaching rulesets (e.g. resets).
 │   └── ...
 ├── elements   // Unclassed HTML elements (e.g. a {}, blockquote {}, address {}).
 │   └── ...
 ├── objects    // Objects, abstractions, and design patterns (e.g. .grid {}, media {}).
 │   └── ...
 ├── components // Components like buttons, teaser, etc.
 │   └── ...
 ├── vendor     // Vendor styles and e.g. theme overwrites.
 │   └── ...
 ├── utilities  // High-specificity, very explicit selectors. (e.g. .u-hidden {}).
 │   └── ...
 └── all.less   // Main entry point
```
