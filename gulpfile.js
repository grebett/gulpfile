//  .----------------.  .----------------.  .----------------.  .----------------.
// | .--------------. || .--------------. || .--------------. || .--------------. |
// | |    ______    | || | _____  _____ | || |   _____      | || |   ______     | |
// | |  .' ___  |   | || ||_   _||_   _|| || |  |_   _|     | || |  |_   __ \   | |
// | | / .'   \_|   | || |  | |    | |  | || |    | |       | || |    | |__) |  | |
// | | | |    ____  | || |  | '    ' |  | || |    | |   _   | || |    |  ___/   | |
// | | \ `.___]  _| | || |   \ `--' /   | || |   _| |__/ |  | || |   _| |_      | |
// | |  `._____.'   | || |    `.__.'    | || |  |________|  | || |  |_____|     | |
// | |              | || |              | || |              | || |              | |
// | '--------------' || '--------------' || '--------------' || '--------------' |
//  '----------------'  '----------------'  '----------------'  '----------------'
//
// gulpfile.js by grebett - created 22/04/2015 / last modified 22/04/2015
// ════════════════════════════════════════════════════════════════

// ╔════════════════════════════════╗
// ║              Requirements              ║
// ╚════════════════════════════════╝

var path = require('path');

var gulp = require('gulp');
var babel = require('gulp-babel');
var bower = require('main-bower-files');
var compass = require('gulp-compass');
var inject = require('gulp-inject');
var minify = require('gulp-minify-css');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');

var chalk = require('chalk');

var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

var config = require('./config');

// ╔════════════════════════════════╗
// ║                 Tools                  ║
// ╚════════════════════════════════╝

var getPath = function (files) {
  if (files instanceof Array) {
    for (var i = 0; i < files.length; i++) {
      files[i] = path.join(config.baseDir, files[i]);
    }
  }
  else
    files = path.join(config.baseDir, files);

  return files;
};

// ╔════════════════════════════════╗
// ║                 Tasks                  ║
// ╚════════════════════════════════╝

gulp.task('html', function () {
  return gulp
    .src(getPath('**/*.html'))
    .pipe(reload({stream: true}));
});

gulp.task('babel', function () {
  if (!config.ES6) {
    console.error(chalk.blue('Warning: ') + 'Babel ES6 option is disabled. See `config.js`.');
    return;
  }

  return gulp
    .src(getPath('js/**/*.es6.js'))
    .pipe(plumber())
    .pipe(babel())
    .pipe(rename(function (path) {
      path.basename = path.basename.replace('.es6', '');
    }))
    .pipe(gulp.dest(getPath('js')))
    .pipe(reload({stream: true}));
});

gulp.task('compass', ['html'], function () {
  return gulp
    .src(getPath('sass/*.scss'))
    .pipe(plumber())
    .pipe(compass({
      config_file: 'config.rb',
      css: getPath('css'),
      sass: getPath('sass')
    }))
    .pipe(gulp.dest(getPath('css')))
    .pipe(reload({stream: true}));
});

gulp.task('minify', function() {
  return gulp
    .src(getPath('css/*.css'))
    .pipe(sourcemaps.init())
    .pipe(minify())
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest('build/css'));
});

gulp.task('uglify', function() {
  return gulp
    .src([getPath('js/*.js'), '!' + getPath('js/*.es6.js')])
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest('build/js'));
});

gulp.task('inject', function () {
  var target = gulp.src(getPath('index.html'));
  var src = gulp.src([getPath('css/*.css'), getPath('js/*.js'), '!' + getPath('js/*.es6.js')], {read: false});
  var bowerFiles = gulp.src(bower({env: config.env}), {read: false});

  return target
    .pipe(inject(src, {relative: true}))
    .pipe(inject(bowerFiles, {name: 'bower'}))
    .pipe(gulp.dest(config.baseDir));
});

// ╔════════════════════════════════╗
// ║                 Watch                  ║
// ╚════════════════════════════════╝

gulp.task('watch', function () {
  var watched = [{
    files: getPath(['**/*.html']),
    tasks: ['html']
  }, {
    files: getPath(['js/**/*.es6.js']),
    tasks: ['babel']
  }, {
    files: getPath(['sass/**/*.scss']),
    tasks: ['compass']
  }, {
    files: ['bower.json', getPath('js/**/*.js'), '!' + getPath('js/**/*.es6.js')],
    tasks: ['inject']
  }];

  // closure to pair the correct tasks and the specified files: need to be reworked with ES6 later
  (function () {
    for (var i = 0; i < watched.length; i++) {
      gulp.watch(watched[i].files, watched[i].tasks);
    }
  })(watched);
});

// ╔════════════════════════════════╗
// ║                 Build                  ║
// ╚════════════════════════════════╝

gulp.task('build', ['minify', 'uglify'], function () {
  console.log(chalk.yellow('/!\\') + ' build should be completed later.');
});

// ╔════════════════════════════════╗
// ║             Browser-sync               ║
// ╚════════════════════════════════╝

gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: 'src',
      routes: {
        '/bower_components': 'bower_components'
      }
    },
    browser: ['google chrome'],
    logPrefix: config.projectName || 'unnamed',
    logConnections: true,
    logLevel: 'info' // info, debug, warn, silent
  });
});

// ╔════════════════════════════════╗
// ║                Default                 ║
// ╚════════════════════════════════╝

gulp.task('default', ['babel', 'compass', 'inject', 'browser-sync', 'watch']);
