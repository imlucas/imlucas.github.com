var d3 = require('d3');


var n = 25,
  duration = 500,
  now = new Date(Date.now() - duration),
  count = 0,
  data = d3.range(n).map(function(){return 0;}),
  interpolation = 'step-after';

var width = 320,
    height = 120;

var x = d3.time.scale()
    .domain([now - (n - 2) * duration, now - duration])
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var svg = d3.select('body').append('p')
  .append('svg')
    .attr('class', 'data-stream')
  .append('g')
    .attr('transform', 'translate(40,10)');

var clipId = 'clip-' + Math.random();

svg.append('defs')
  .append('clipPath')
    .attr('id', clipId)
    .attr('class', '.data-stream-clip')
  .append('rect')
    .attr('width', width)
    .attr('height', height);

var axis = svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(x.axis = d3.svg.axis().scale(x).orient('bottom'));

var yAxis = svg.append('g')
    .attr('class', 'y-axis')
    .attr('transform', 'translate(10,0)')
    .call(y.axis = d3.svg.axis().scale(y).orient('left'));

// ## Stage
var clip = svg.append('g')
  .attr('class', 'data-stream-stage')
  .attr('clip-path', 'url(#' + clipId + ')');

  // # line
  var line = d3.svg.line()
      .interpolate(interpolation)
      .x(function(d, i) { return x(now - (n - 1 - i) * duration); })
      .y(function(d, i) { return y(d); });


  var areaShape = d3.svg.area()
    .interpolate(interpolation)
    .x(function(d, i) { return x(now - (n - 1 - i) * duration); })
    .y0(height)
    .y1(function(d, i) { return y(d); });

  var area = clip.append('path')
    .data([data])
    .attr('class', 'data-stream-area')
    .attr('d', areaShape);

  var path = clip.append('path')
      .data([data])
      .attr('class', 'data-stream-line')
      .attr('d', line);

tick();

d3.select(window).on('scroll', function() { ++count; });

function tick(){
  // update the domains
  now = new Date();
  x.domain([now - (n - 2) * duration, now - duration]);
  y.domain([0, d3.max(data)]);

  var commit = count;
  // push the accumulated count onto the back, and reset the count
  data.push(commit);
  console.log(data.length);
  count = 0;

  // redraw the lines
  svg.select('.data-stream-line')
      .attr('d', line)
      .attr('transform', null);

  svg.select('.data-stream-area')
    .attr('d', areaShape)
    .attr('transform', null);


  // slide the x-axis left
  axis.transition()
      .duration(duration)
      .ease('linear')
      .call(x.axis);

  // change scale if we need to
  yAxis.transition()
    .duration(duration)
    .ease('linear')
    .call(y.axis);

  // slide the line left
  d3.selectAll('.data-stream-stage path').call(function(p){
    p.transition()
      .duration(duration)
      .ease('linear')
      .attr('transform', 'translate(' + x(now - (n - 1) * duration) + ')')
      .each('end', function(d, i){
        if(i === 1) return tick();
      });
  });
  // pop the old data point off the front
  data.shift();
}
