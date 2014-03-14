"use strict";

// Simple way to make a nice chart with a single metric being streamed into it.
//
// @todo: make this an actual duplex stream.
var _ = require('lodash'),
  d3 = require('d3'),
  debug = require('debug')('creek');

module.exports = function(selector, opts){
  opts = opts || {};
  opts.selector = selector;
  return new Creek(opts);
};

function Creek(opts){
  _.extend(this, _.defaults({}, opts, {
    minutes: 2,
    data: [],
    interpolation: 'cardinal',
    width: window.innerWidth,
    height: 160,
    selector: 'body',
    line: true,
    area: true,
    history: []
  }));

  this.scrollback = 60 * this.minutes;
  this.duration = 1000 / this.minutes;

  this.value = 0;
  this.clipId = 'clip-' + Math.random();
}

Creek.prototype.render = function(){
  this.selection = d3.select(document.querySelector(this.selector));
  var self = this, series;
  this.tickAt = -1;

  this.axisOffset = 0;

  this.svg = this.selection
    .append('svg')
      .attr('class', 'creek')
      .attr('height', this.height)
      .attr('width', this.width)
    .append('g');

  this.stage = {
    height: this.height - 18,
    width: this.width - this.axisOffset
  };

  this.now = new Date(Date.now() - this.duration);
  this.scales = {
    x: d3.time.scale()
      .domain([self.now - (this.scrollback - 2) * this.duration, this.now - this.duration])
      .range([0, this.stage.width]),
    y: d3.scale.linear()
    .range([this.stage.height, 0])
    .domain([0, 0])
  };

  this.shapes = {
    line: d3.svg.line().interpolate(this.interpolation)
      .x(function(d, i){
        return self.scales.x(self.now - (self.scrollback - 1 - i) * self.duration);
      })
      .tension(0.5)
      .y(function(d, i){
        return self.scales.y(d);
      }),
    area: d3.svg.area().interpolate(this.interpolation)
      .x(function(d, i){
        return self.scales.x(self.now - (self.scrollback - 1 - i) * self.duration);
      })
      .y1(function(d, i){
        return self.scales.y(d);
      })
      .y0(self.stage.height)
      .tension(0.5)
  };

  this.svg.append('defs').append('clipPath')
      .attr('id', this.clipId)
    .append('rect')
      .attr('width', this.stage.width - 25)
      .attr('height', this.stage.height);

  this.axes = {
    x: this.svg.append('g')
      .attr('class', 'x-axis axis')
      .attr('transform', 'translate('+ -25 +',' + this.stage.height + ')')
      .call(this.scales.x.axis = d3.svg.axis().scale(this.scales.x).orient('bottom'))
      .call(this.scales.x.axis.ticks(4).tickSubdivide(0)),
    y: this.svg.append('g')
      .attr('class', 'y-axis axis')
      .attr('transform', 'translate(' + (this.stage.width - 25) + ', 0)')
      .call(this.scales.y.axis = d3.svg.axis().scale(this.scales.y).orient('right'))
      .call(this.scales.y.axis.ticks(4).tickSubdivide(0).tickSize(-this.stage.width))
  };

  series = this.svg
    .append('g')
      .attr('class', 'series')
      .attr('clip-path', 'url(#' + this.clipId + ')');

  if(this.line){
    this.line = series.append('path')
      .data([this.data])
      .attr('class', 'line')
      .attr('d', this.shapes.line);
      this.tickAt++;
  }

  if(this.area){
    this.area = series.append('path')
      .data([this.data])
      .attr('class', 'area')
      .attr('d', this.shapes.area);
    this.tickAt++;
  }


  this.paused = false;

  this.tick();
  return this;
};

Creek.prototype.pause = function(i){
  this.paused = true;
  return this;
};

Creek.prototype.resume = function(i){
  this.paused = false;
  this.tick();
  return this;
};

Creek.prototype.inc = function(i){
  this.value += i;
  return this;
};

Creek.prototype.consume = function(){
  this.data.push(this.value);
  this.value = 0;
  this.history.push(this.data.shift());
  return this;
};

Creek.prototype.tick = function(){
  if(this.paused === true) return this;
  var max = d3.max(this.data);
  // update current time for smoothness.
  this.now = new Date();
  this.consume();

  this.scales.x.domain([this.now - (this.scrollback - 2) * this.duration, this.now - this.duration]);
  this.scales.y.domain([0, max]);

  if(this.line){
    this.svg.select('.line')
      .attr('d', this.shapes.line)
      .attr('transform', null);
  }

  if(this.area){
    this.svg.select('.area')
      .attr('d', this.shapes.area)
      .attr('transform', null);
  }

  this.transition();
};

Creek.prototype.transitionAxis = function(id){
  this.axes[id].transition()
    .duration(this.duration)
    .ease(id === 'y' ? 'elastic-out-in' : 'linear')
    .call(this.scales[id].axis);
};

Creek.prototype.transition = function(){
  var self = this;

  // Adjust axes and scaling for incoming value
  ['x', 'y'].map(this.transitionAxis.bind(this));

  // Move the whole world over to expose the next value
  d3.selectAll(document.querySelectorAll(this.selector + ' .series path')).call(function(p){
    p.transition()
      .duration(self.duration)
      .ease('linear')
      .attr('transform', 'translate(' + self.scales.x(self.now - (self.scrollback - 1) * self.duration) + ')')
      .each('end', function(d, i){return (i === self.tickAt) ? self.tick() : null;});
  });
};
