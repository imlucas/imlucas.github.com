require('debug').enable('*');

var creek = require('./creek'),
  $ = require('jquery'),
  d3 = require('d3'),
  debug = require('debug')('graphs');

window.d3 = d3;

$('body')
  .append(
    '<div id="graph-2">' +
    '</div>')
  .append(
    '<div id="graph-1" class="mms">' +
    '</div>')
  .append(
    '<div id="graph-3" class="soda-dark">' +
    '</div>');

function gen(){
  var rand = d3.random.logNormal(2, 0.5);
  return d3.range(400).map(function(){
    return rand() * 2;
  });
}

var creeks = {
  'graph-1': creek('#graph-1', {interpolation: 'step-after', data: gen()}).render(),
  'graph-2': creek('#graph-2', {interpolation: 'monotone', data: gen()}).render(),
  'graph-3': creek('#graph-3', {data: gen()}).render()
};

$('button').on('click', function(){
  var c = creeks[$(this).data('creek')];
  debug('clicked');
  if($(this).data('action')){
    c.inc(5);
  }
  else{
    c[(c.paused ? 'resume' : 'pause')]();
  }
});
