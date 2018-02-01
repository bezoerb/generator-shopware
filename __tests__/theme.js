'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

describe('generator-shopware:theme', () => {
  beforeAll(() => {
    return helpers.run(path.join(__dirname, '../generators/theme'))
      .withPrompts({
        name: 'test',
        parent: 'Responsive',
        activate: false,
        url: 'localhost'
      });
  });

  it('creates files', () => {
    assert.file([
      '.babelrc',
      '.browserslistrc',
      '.editorconfig',
      '.env',
      '.eslintrc',
      '.gitignore',
      'Theme.php',
      'plugin.png',
      'karma.conf.js',
      'package.json',
      'webpack.config.js',
      '_private/smarty/function.icon.php',
      'frontend/_public/src/js/main.js',
      'frontend/_public/src/less/all.less',
      'frontend/_public/src/less/elements/headings.less',
      'frontend/_public/src/less/elements/images.less',
      'frontend/_public/src/less/elements/page.less',
      'frontend/_public/src/less/elements/tables.less',
      'frontend/_public/src/less/generic/box-sizing.less',
      'frontend/_public/src/less/generic/normalize.less',
      'frontend/_public/src/less/generic/reset.less',
      'frontend/_public/src/less/generic/shared.less',
      'frontend/_public/src/less/settings/core.less',
      'frontend/_public/src/less/settings/global.less',
      'frontend/_public/src/less/tools/font-size.less',
      'frontend/_public/src/less/tools/hidden.less',
      'frontend/_public/src/less/tools/object-fit.less',
      'frontend/_public/src/less/objects/block.less',
      'frontend/_public/src/less/objects/box.less',
      'frontend/_public/src/less/objects/crop.less',
      'frontend/_public/src/less/objects/flag.less',
      'frontend/_public/src/less/objects/layout.less',
      'frontend/_public/src/less/objects/list-bare.less',
      'frontend/_public/src/less/objects/list-inline.less',
      'frontend/_public/src/less/objects/media.less',
      'frontend/_public/src/less/objects/pack.less',
      'frontend/_public/src/less/objects/ratio.less',
      'frontend/_public/src/less/objects/table.less',
      'frontend/_public/src/less/objects/wrapper.less',
      'frontend/_public/src/less/utilities/clearfix.less',
      'frontend/_public/src/less/utilities/headings.less',
      'frontend/_public/src/less/utilities/hide.less',
      'frontend/_public/src/less/utilities/print.less',
      'frontend/_public/src/less/utilities/spacings.less',
      'frontend/index/datepicker-config.tpl',
      'frontend/index/header.tpl',
      'frontend/index/index.tpl',
      'tasks/exec.js',
      'tasks/images.js',
      'tasks/psi.js',
      'tasks/scripts.js',
      'tasks/server.js',
      'tasks/service-worker.js',
      'tasks/styles.js',
      'tasks/tests.js',
      'tasks/helper/env.js',
      'tasks/helper/utils.js'
    ]);
  });
});
