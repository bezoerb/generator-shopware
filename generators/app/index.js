'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const ui = require('shopware-cli/lib/ui');
const shopwareCli = require('shopware-cli');
const globby = require('globby');

module.exports = class extends Generator {
  prompting() {
    this.log(yosay(
      'Welcome to the fabulous ' + chalk.red('shopware') + ' generator!'
    ));

    return globby(['*/shopware.php', '.shopware-cli.json'], {cwd: this.env.cwd})
      .then(files => this.prompt(ui.prompts({initial: files.length === 0})).then(props => {
        this.props = props;
        this.config.set(props);
      }));
  }

  writing() {
    return shopwareCli('install', {}, this.props);
  }

  install() {
    this.log(`I'm all done. To add a theme run ${chalk.green('yo shopware:theme')}`);
  }
};
