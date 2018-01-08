const gulp = require('gulp');
const {dir, paths} = require('./helper/utils');
const gulpLoadPlugins = require('gulp-load-plugins');
const $ = gulpLoadPlugins();

const rev = () =>
  gulp.src([dir('tmp', '**/*.{jpg,jpeg,gif,png,webp,svg}')], {base: paths.tmp})
    .pipe($.rev())
    .pipe(gulp.dest(dir('template')))
    .pipe($.rev.manifest(dir('prod','rev-manifest.json'), {
      base: dir('prod'),
      merge: true
    }))
    .pipe(gulp.dest(dir('prod')))
    .pipe($.size({title: 'rev'}));

const revManifest = () => {
  const manifest = gulp.src(dir('prod', 'rev-manifest.json'));

  return gulp.src(dir(
    'prod',
    'styles/*.css',
    'scripts/*.js'
  ), {base: dir('prod')})
    .pipe($.revReplace({manifest: manifest, replaceInExtensions: ['.js', '.css']}))
    .pipe(gulp.dest(dir('prod')));
};

module.exports = {
  rev,
  revManifest,
};
