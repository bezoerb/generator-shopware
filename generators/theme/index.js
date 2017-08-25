'use strict';
const path = require('path');
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const inquirer = require('inquirer');
const globby = require('globby');
const capitalize = require('lodash/capitalize');
const kebabCase = require('lodash/kebabCase');
const findUp = require('find-up');
const fs = require('fs-extra');

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the impressive ' + chalk.red('shopware:theme') + ' generator!'
    ));

    this.props = this.config.getAll() || {};

    const rootpath = findUp.sync('.yo-rc.json', {cwd: this.env.cwd});
    if (rootpath) {
      this.props.rootpath = path.dirname(rootpath);
    }

    const prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'What\'s the name of the new theme',
        validate: value => Boolean(value) || 'Please provide a theme name'
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
        name: 'url',
        message: 'What\'s your dev host',
        default: () => this.props.url || 'localhost',
        when: () => !this.props.url
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = Object.assign({}, this.props, props, {
        themename: kebabCase(props.name),
        capitalizedThemename: capitalize(props.name)
      });
    });
  }

  writing() {
    const base = this.props.rootpath ? path.join(this.props.rootpath, 'themes/Frontend') : this.env.cwd;
    const destBase = (kebabCase(this.appname) === this.props.themename) ? '' : path.join(base, this.props.themename);
    const tempateBase = this.props.parent.toLowerCase();
    const globOptions = {cwd: this.templatePath(tempateBase), dot: true, nodir: true};

    if (this.env.cwd !== destBase) {
      this.destinationRoot(destBase);
    }

    const copy = list =>
      list.forEach(file => this.fs.copy(
        this.templatePath(path.join(tempateBase, file)),
        this.destinationPath(file)
      ));

    const tmpl = list =>
      list.forEach(file => this.fs.copyTpl(
        this.templatePath(path.join(tempateBase, file)),
        this.destinationPath(file),
        this.props
      ));

    return Promise.all([
      globby(['**/*.{jpg,png,gif}'], globOptions).then(list => copy(list)),
      globby(['**/*', '!**/*.{jpg,png,gif}'], globOptions).then(list => tmpl(list))
    ]);
  }

  install() {
    this.installDependencies({bower: false});

    // Symlink theme if we're not standalone
    if (this.props.rootpath) {
      const src = path.join(this.props.rootpath, 'themes/Frontend/', this.props.themename);
      const dest = path.join(this.props.rootpath, 'src/themes/Frontend/', this.props.themename);
      return fs.ensureSymlink(path.relative(path.dirname(dest), src), dest);
    }
  }
};
