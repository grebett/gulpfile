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
// gulpfile.js by grebett - 20/04/2015
// ════════════════════════════════════════════════════════════════

// ╔════════════════════════════════╗
// ║              Requirements              ║
// ╚════════════════════════════════╝

var gulp = require('gulp');
var babel = require('gulp-babel');
var compass = require('gulp-compass');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var watch = require('gulp-watch');

var chalk = require('chalk');

var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

var config = require('./config');

// ╔════════════════════════════════╗
// ║                 Tasks                  ║
// ╚════════════════════════════════╝

gulp.task('html', function () {
  return gulp
    .src(['**/*.html', '!./node_modules/**'])
    .pipe(reload({stream: true}));
});

gulp.task('babel', function () {
  if (!config.ES6) {
    console.error(chalk.red('Error: ') + 'you call babel task but ES6 option is disabled. See `config.js`.');
    return;
  }

  return gulp
    .src(['js/**/*.es6.js'])
    .pipe(plumber())
    .pipe(babel())
    .pipe(rename(function (path) {
      path.basename = path.basename.replace('.es6', '');
    }))
    .pipe(gulp.dest('js'))
    .pipe(reload({stream: true}));
});

gulp.task('compass', ['html'], function () {
  return gulp
    .src('./sass/*.scss')
    .pipe(plumber())
    .pipe(compass({
      config_file: './config.rb',
      css: 'css',
      sass: 'sass'
    }))
    .pipe(gulp.dest('./css'))
    .pipe(reload({stream: true}));
});

// ╔════════════════════════════════╗
// ║                 Watch                  ║
// ╚════════════════════════════════╝

gulp.task('watch', function () {
  var watched = [{
    files: ['**/*.html'],
    tasks: ['html']
  }, {
    files: ['js/**/*.es6.js'],
    tasks: ['babel']
  }, {
    files: ['sass/**/*.scss'],
    tasks: ['compass']
  }];

  // closure to pair the correct tasks and the specified files: need to be reworked with ES6 later
  (function () {
    for (var i = 0; i < watched.length; i++) {
      gulp.watch(watched[i].files, watched[i].tasks);
    }
  })(watched);
});

// ╔════════════════════════════════╗
// ║             Browser-sync               ║
// ╚════════════════════════════════╝

gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
        baseDir: "./"
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

gulp.task('default', ['browser-sync', 'watch']);
