var gulp = require('gulp'),
  ecstatic = require('ecstatic'),
  browserify = require('browserify'),
  Notification = require('node-notifier'),
  source = require('vinyl-source-stream');

gulp.task('dev', ['build', 'server', 'watch']);
gulp.task('build', ['js', 'pages', 'less', 'assets']);

gulp.task('server', function(){
  require('http').createServer(ecstatic({root: __dirname + '/static'}))
    .listen(2222);
});

gulp.task('watch', function(){
  var tty = require('tty');

  function raw (mode) {
    if (typeof process.stdin.setRawMode === 'function') {
      process.stdin.setRawMode(mode);
    } else {
      tty.setRawMode(mode);
    }
  }

  if (tty.isatty(0)) {
    process.stdin.resume();
    raw(true);
    process.stdin.on('data', function (b) {
      var key = b.toString('utf8');
      switch (key) {
        case '\u0003': // Ctrl+C
          process.exit();
          break;

        case '\u0012': // Ctrl+R
          gulp.start('build');
          break;
      }
    });
    console.log('[ctrl+c to quit]');
    console.log('[ctrl+r to reload]');
  }

  gulp.watch(['*.js'], ['js']);
  gulp.watch(['*.less'], ['less']);
  gulp.watch(['*.jade'], ['pages']);
});

gulp.task('js', function(){
  var notifier = new Notification({});
  browserify({entries: ['./index.js']})
    .bundle({debug: false})
    .on('error', function(err){
      var path = (err.annotated || err.message).replace(__dirname + '/', '').split('\n')[1],
        title = 'err: ' + path;
      notifier.notify({title: title || 'js error', message: err.annotated || err.message});
      console.error('js error', err);
    })
    .pipe(source('index.js'))
    .pipe(gulp.dest('static/'));
});

gulp.task('assets', function(){
  gulp.src(['*.css', 'fonts/*', '*.jpg'])
    .pipe(gulp.dest('static/'));
});

gulp.task('less', function () {
  var lessPaths = [
    'ui/less',
    'ui/less/atom',
    'ui/less/atom/variables'
  ],
  notifier = new Notification({}),
  less = function(){
    return require('gulp-less')({paths: lessPaths}).on('error', function(err){
      var filename = err.fileName.replace(__dirname + '/', ''),
        title = 'err: ' + filename,
        message = err.lineNumber + ': ' + err.message.split(' in file ')[0].replace(/`/g, '"');

      notifier.notify({title: title, message: message});
      console.error(title, message);
    });
  };

  gulp.src('*.less')
    .pipe(less())
    .pipe(gulp.dest('static'));
});

gulp.task('pages', function(){
  var notifier = new Notification({}),
    jade = function(){
        return require('gulp-jade')({pretty: false}).on('error', function(err){
          notifier.notify({title: 'jade error', message: err.message});
          console.error('jade error', err);
        });
      };

  gulp.src('*.jade')
    .pipe(jade())
    .pipe(gulp.dest('static/'));
});
