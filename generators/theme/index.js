'use strict';
const path = require('path');
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const globby = require('globby');
const upperFirst = require('lodash/upperFirst');
const camelCase = require('lodash/camelCase');
const kebabCase = require('lodash/kebabCase');
const findUp = require('find-up');
const fs = require('fs-extra');
const execa = require('execa');
const mysql = require('mysql');

// Get database
function getDbConnection(props) {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection({
      host: props.dbhost,
      port: props.dbport,
      user: props.dbuser,
      password: props.dbpass,
      database: props.dbname
    });

    connection.connect(err => {
      if (err) {
        console.error('error connecting: ' + err.stack);
        return reject(err);
      }

      resolve({
        destroy: () =>
          new Promise((resolve, reject) => {
            connection.destroy(err => (err && reject(err)) || resolve());
          }),
        query: (...params) =>
          new Promise((resolve, reject) => {
            connection.query(...params, (err, results) => (err && reject(err)) || resolve(results));
          })
      });
    });
  });
}

module.exports = class extends Generator {
  initializing() {
    this.props = this.config.getAll() || {themes: ['Bare', 'Responsive']};

    let rootpath = findUp.sync('.yo-rc.json', {cwd: this.env.cwd});
    if (rootpath) {
      this.props.rootpath = path.dirname(rootpath);
    } else {
      this.props.rootpath = this.env.cwd;
    }

    // Validate props if config.php is present
    let config = path.join(this.props.rootpath, 'shopware', 'config.php');
    if (!fs.existsSync(config)) {
      config = path.join(this.props.rootpath, 'config.php');
    }
    if (fs.existsSync(config)) {
      const done = this.async();
      const swagConfig = fs.readFileSync(config, 'utf8').replace(/\/\/.*/g, '');
      [...Object.keys(this.props), 'dbuser', 'dbpass', 'dbhost', 'dbport', 'dbname'].forEach(key => {
        let regexp;
        switch (key) {
          case 'dbuser':
            regexp = new RegExp(`['"]username['"]\\s+=>\\s+['"]([^'"]+)['"]`);
            break;
          case 'dbpass':
            regexp = new RegExp(`['"]password['"]\\s+=>\\s+['"]([^'"]+)['"]`);
            break;
          case 'dbhost':
            regexp = new RegExp(`['"]host['"]\\s+=>\\s+['"]([^'"]+)['"]`);
            break;
          case 'dbport':
            regexp = new RegExp(`['"]port['"]\\s+=>\\s+['"]([^'"]+)['"]`);
            break;
          case 'dbname':
            regexp = new RegExp(`['"]dbname['"]\\s+=>\\s+['"]([^'"]+)['"]`);
            break;
          default:
            break;
        }

        const match = regexp && regexp.exec(swagConfig);
        if (match && match[1] !== this.props[key]) {
          this.props[key] = match[1];

          this.config.save();
        }
      });

      return getDbConnection(this.props).then(connection => {
        connection
          .query(`SELECT template FROM s_core_templates`)
          .then(results => {
            this.props.themes = Array.from(results).map(data => data.template);
          })
          .then(() => {
            connection.destroy();
            done();
          })
          .catch(err => {
            console.log(err);
            done();
          });
      });
    }

    this.props.rootpath = undefined;
  }

  prompting() {
    // Have Yeoman greet the user.
    this.log(yosay('Welcome to the impressive ' + chalk.red('shopware:theme') + ' generator!'));

    const prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'What\'s the name of the new theme',
        validate: value => Boolean(value) || 'Please provide a theme name'
      },
      {
        type: 'list',
        name: 'parent',
        message: 'Select parent theme',
        choices: this.props.themes
      },
      {
        type: 'confirm',
        name: 'activate',
        message: 'Do you want me to directly activate the new theme',
        default: true,
        when: () => this.props.dbname && this.props.dbuser && this.props.dbhost
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
        capitalizedThemename: upperFirst(camelCase(props.name))
      });
    });
  }

  writing() {
    const base = this.props.rootpath ? path.join(this.props.rootpath, 'themes/Frontend') : this.env.cwd;
    const destBase =
      this.appname === this.props.capitalizedThemename ? '' : path.join(base, this.props.capitalizedThemename);
    const tempateBase = this.props.parent === 'Bare' ? 'bare' : 'responsive';
    const globOptions = {
      cwd: this.templatePath(tempateBase),
      dot: true,
      nodir: true
    };
    const globOptionsCommon = {
      cwd: this.templatePath('_common'),
      dot: true,
      nodir: true
    };

    if (this.env.cwd !== destBase) {
      this.destinationRoot(destBase);
    }

    const copy = (base, list) =>
      list.forEach(file => this.fs.copy(this.templatePath(path.join(base, file)), this.destinationPath(file)));

    const tmpl = (base, list) =>
      list.forEach(file =>
        this.fs.copyTpl(this.templatePath(path.join(base, file)), this.destinationPath(file), this.props)
      );

    return Promise.all([
      globby(['**/*.{jpg,png,gif}'], globOptionsCommon).then(list => copy('_common', list)),
      globby(['**/*', '!**/*.{jpg,png,gif}'], globOptionsCommon).then(list => tmpl('_common', list))
    ]).then(() => Promise.all([
      globby(['**/*.{jpg,png,gif}'], globOptions).then(list => copy(tempateBase, list)),
      globby(['**/*', '!**/*.{jpg,png,gif}'], globOptions).then(list => tmpl(tempateBase, list))
    ]));
  }

  install() {
    const promises = [
      new Promise((resolve, reject) => {
        this.installDependencies({
          bower: false,
          callback: err => (err && reject(err)) || resolve()
        });
      })
    ];

    // Symlink theme if we're not standalone
    if (this.props.rootpath) {
      const src = path.join(this.props.rootpath, 'themes/Frontend/', this.props.capitalizedThemename);
      const dest = path.join(this.props.rootpath, 'shopware/themes/Frontend/', this.props.capitalizedThemename);
      promises.push(fs.ensureSymlink(path.relative(path.dirname(dest), src), dest));
    }

    if (this.props.activate && this.props.rootpath) {
      // Synchronice theme
      promises.push(
        execa('php', [path.join(this.props.rootpath, 'shopware/bin/console'), 'sw:theme:synchronize']).then(() =>
          getDbConnection(this.props).then(connection => {
            // Fetch theme id
            console.log('Activating theme');
            connection
              .query(`SELECT id FROM s_core_templates WHERE template LIKE "${this.props.capitalizedThemename}"`)
              .then(results => {
                const result = results[0];
                return connection.query(
                  `UPDATE s_core_shops SET template_id = ${result.id}, document_template_id = ${
                    result.id
                  } WHERE ${'`default`'} = 1`
                );
              })
              .then(() => connection.destroy());
            //
            //   .then( ), (err, results) => {
            //   if (err) {
            //     console.log(err);
            //     return reject(err);
            //   }
            //
            //   if (results.length) {
            //     const result = results[0];
            //
            //     connection.query(`UPDATE s_core_shops SET template_id = ${result.id}, document_template_id = ${result.id} WHERE ${'`default`'} = 1`, err => {
            //       if (err) {
            //         console.log(err);
            //         return reject(err);
            //       }
            //       connection.destroy(err => (err && reject(err)) || resolve());
            //     });
            //   }
            // });
          })
        )
      );
    }

    // Promises.push(new Promise((resolve, reject) => {
    //   const connection = mysql.createConnection({
    //     host: this.props.dbhost,
    //     port: this.props.dbport,
    //     user: this.props.dbuser,
    //     password: this.props.dbpass,
    //     database: this.props.dbname
    //   });
    //
    //   connection.connect(err => {
    //     if (err) {
    //       console.error('error connecting: ' + err.stack);
    //       return reject(err);
    //     }
    //
    //
    //   //   });
    //   }));
    // }

    return Promise.all([promises]);
  }
};
