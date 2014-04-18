require('http')
  .createServer(require('ecstatic')({root: __dirname + '/../static'}))
  .listen(33333);
