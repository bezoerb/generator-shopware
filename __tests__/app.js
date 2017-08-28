'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('generator-shopware:app', () => {
  beforeAll(() => {
    return helpers.run(path.join(__dirname, '../generators/theme'))
      .withPrompts({
        url: 'localhost',
        dbname: 'shopware_test',
        dbuser: 'root',
        dbpass: '',
        dbhost: '127.0.0.1'
      });
  });

  it.skip('creates files', () => {
    assert.file([
      'src/config.php'
    ]);
  });
});
