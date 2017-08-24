'use strict';
const path = require('path');
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const inquirer = require('inquirer');
const globby = require('globby');
const capitalize = require('lodash/capitalize');
const kebabCase = require('lodash/kebabCase');

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the impressive ' + chalk.red('shopware:theme') + ' generator!'
    ));

    const prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'What\'s the name of the new theme',
        default: () => this.appname
      }, {
        type: 'list',
        name: 'parent',
        message: 'Select parent theme',
        choices: [
          'Responsive',
          new inquirer.Separator(),
          {
            name: 'Bare',
            disabled: 'Unavailable at this time'
          }
        ]
      },
      {
        type: 'input',
        name: 'host',
        message: 'What\'s your dev host',
        default: () => 'localhost'
      },
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = Object.assign({}, props, {
        themename: kebabCase(props.name),
        capitalizedThemename: capitalize(props.name)
      });
    });
  }

  writing() {
    const destBase = (kebabCase(this.appname) === this.props.themename) ? '' : this.props.themename;
    const tempateBase = this.props.parent.toLowerCase();
    const globOptions = {cwd: this.templatePath(tempateBase), dot: true, nodir: true};

    const copy = list =>
      list.forEach(file => this.fs.copy(
        this.templatePath(path.join(tempateBase, file)),
        this.destinationPath(destBase ? path.join(destBase, file) : file)
      ));

    const tmpl = list =>
      list.forEach(file => this.fs.copyTpl(
        this.templatePath(path.join(tempateBase, file)),
        this.destinationPath(destBase ? path.join(destBase, file) : file),
        this.props
      ));

    return Promise.all([
      globby(['**/*.{jpg,png,gif}'], globOptions).then(list => copy(list)),
      globby(['**/*', '!**/*.{jpg,png,gif}'], globOptions).then(list => tmpl(list))
    ]);
  }

  install() {
    this.installDependencies();
  }
};
