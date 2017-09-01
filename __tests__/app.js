'use strict';
const path = require('path');
const assert = require('assert');
const helpers = require('yeoman-test');

describe('generator-shopware:app', () => {
  it('Calls shopware-cli with the passed parameters', () => {
    jest.mock('shopware-cli', () => {
      return jest.fn((command, args, options) => {
        this.command = command;
        this.args = args;
        this.options = options;
      });
    });

    const opts = {
      url: 'localhost',
      dbname: 'test-db',
      dbuser: 'myself',
      dbpass: 'myverysecretpass',
      dbhost: '192.186.0.1',
      dbport: '1234'
    };

    return helpers.run(path.join(__dirname, '../generators/app'))
      .withPrompts(opts).toPromise()
      .then(() => {
        assert.equal(this.command, 'install');
        assert.deepEqual(this.args, {});
        assert.deepEqual(this.options, opts);
      });
  });
});
