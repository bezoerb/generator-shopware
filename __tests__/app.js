'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

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

  it('creates files', () => {
    assert.file([
      'src/config.php'
    ]);
  });
});
