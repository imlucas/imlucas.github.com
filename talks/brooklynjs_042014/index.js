var mousetrap = require('mousetrap');


function Showtime(){
  this.slides = document.querySelectorAll('#title,section');
  this.index = 0;
  this.current = this.slides[this.index];
  this.offset = 40;
  this.cats = document.querySelectorAll('no-mans-land');
  this.shift = 0;

  this.catablesOn = false;

  window.scrollTo(0, 0);
}

Showtime.prototype.next = function(){
  return this.go(1);
};
Showtime.prototype.prev = function(){
  return this.go(-1);
};

Showtime.prototype.meow = function(){
  var title = document.querySelectorAll('h1')[0];
  if(this.catablesOn === true){
    document.title = title.textContent = title.textContent.replace('cat', 'cut');
    title.classList.remove('meow');

    this.catablesOn = false;
  }
  else {
    document.title = title.textContent = title.textContent.replace('cut', 'cat');
    title.classList.add('meow');
    this.catablesOn = true;
  }
};

Showtime.prototype.go = function(i){
  var next = this.index + i;
  console.log('go to ', next, this.slides.length);

  if(next < 0 ||  next === this.slides.length){
    return console.log('end');
  }
  this.cats = document.querySelectorAll('#no-mans-land img');
  this.nml = document.getElementById('no-mans-land');
  console.log(this.shift, this.cats[next].offsetWidth);

  var prev = this.index;
  this.index = next;
  if(i < 0){
    this.shift += this.cats[this.index].offsetWidth;
    console.log('up');
    window.scrollBy(0, -window.innerHeight-this.offset);
    this.nml.setAttribute('style', '-webkit-transform: translate3d('+ this.shift +'px, 0, 0);');
  }
  else {
    this.shift -= this.cats[prev].offsetWidth;
    console.log('down');
    window.scrollBy(0, window.innerHeight+this.offset);

    if(next === this.slides.length -1){
      this.nml.setAttribute('style', '-webkit-transform: translate3d('+ this.shift +'px, 300px, 0)');
    }
    else {
      this.nml.setAttribute('style', '-webkit-transform: translate3d('+ this.shift +'px, 0, 0);');
    }
  }
  this.current = this.slides[this.index];
};

Showtime.prototype.hideCats = function(){
  this.nml = document.getElementById('no-mans-land');
  this.nml.setAttribute('style', '-webkit-transform: translate3d('+ this.shift +'px, 300px, 0)');
  return this;
};

Showtime.prototype.showCats = function(){
  this.nml = document.getElementById('no-mans-land');
  this.nml.setAttribute('style', '-webkit-transform: translate3d('+ this.shift +'px, 0, 0)');
  return this;
};

var slide = window.slide = new Showtime(),
  visible = false;

mousetrap.bind('c', function(){
  if(visible){
    slide.meow();
    slide.hideCats();
    visible = false;
  }
  else{
    slide.showCats();
    slide.meow();
    visible = true;
  }
});

mousetrap.bind('left', function(){
  slide.prev();
  return false;
});

mousetrap.bind('up', function(){
  slide.prev();
  return false;
});

mousetrap.bind('right', function(){
  slide.next();
  return false;
});
mousetrap.bind('down', function(){
  slide.next();
  return false;
});

var el = document.getElementById('no-mans-land'),
  height = 200;

var images = [
  // 'https://pbs.twimg.com/media/BlYsvGZCUAAXP-X.jpg:small',
  // 'https://pbs.twimg.com/media/BlMlYDOIcAEi1of.jpg:small',
  // 'https://pbs.twimg.com/media/BlJvEBLIUAEn9Ow.jpg:small',
  // 'https://pbs.twimg.com/media/BlXGYotCYAEgCg9.jpg:small',
  // 'https://pbs.twimg.com/media/BlT96urCIAA5Wky.jpg:small',
  // 'https://pbs.twimg.com/media/BlSgaSSCQAAs_Sb.jpg:small',
  // 'https://pbs.twimg.com/media/BlRKKLnIMAIEoNz.jpg:small',
  // 'https://pbs.twimg.com/media/BlOfXHdCQAENKTL.jpg:small',
  // 'https://pbs.twimg.com/media/BlNjVN1CYAAo5vg.jpg:small',
  // 'https://pbs.twimg.com/media/BlI7U0tCAAA-PJ5.jpg:small',
  // 'https://pbs.twimg.com/media/BlINu9PIAAAUP4O.jpg:small',
  // 'https://pbs.twimg.com/media/BlDCi9aCIAA-kZF.jpg:small',
  // 'https://pbs.twimg.com/media/Bk_Mb-uCQAAfQRO.jpg:small',
  // 'https://pbs.twimg.com/media/Bk9oF9FCMAAC2LN.jpg:small',
  // 'https://pbs.twimg.com/media/Bk8iaYrIEAAvmvX.jpg:small',
  // 'https://pbs.twimg.com/media/Bk56lWWCYAAHly1.jpg:small'
  'BlYsvGZCUAAXP-X.jpg',
  'BlMlYDOIcAEi1of.jpg',
  'BlJvEBLIUAEn9Ow.jpg',
  'BlXGYotCYAEgCg9.jpg',
  'BlT96urCIAA5Wky.jpg',
  'BlSgaSSCQAAs_Sb.jpg',
  'BlRKKLnIMAIEoNz.jpg',
  'BlOfXHdCQAENKTL.jpg',
  'BlNjVN1CYAAo5vg.jpg',
  'BlI7U0tCAAA-PJ5.jpg',
  'BlINu9PIAAAUP4O.jpg',
  'BlDCi9aCIAA-kZF.jpg',
  'Bk_Mb-uCQAAfQRO.jpg',
  'Bk9oF9FCMAAC2LN.jpg',
  'Bk8iaYrIEAAvmvX.jpg',
  'Bk56lWWCYAAHly1.jpg'
];

var html = '';
images.map(function(src){
  html += '<img src="' + src + '" class="meow" height="'+height+'" />';
});

el.innerHTML = html;

