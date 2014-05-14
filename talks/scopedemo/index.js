var mousetrap = require('mousetrap');


function Showtime(){
  this.slides = document.querySelectorAll('#title,section');
  this.index = 0;
  this.current = this.slides[this.index];
  this.offset = 40;
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
  var prev = this.index;
  this.index = next;
  if(i < 0){
    window.scrollBy(0, -window.innerHeight-this.offset);
  }
  else {
    window.scrollBy(0, window.innerHeight+this.offset);
  }
  this.current = this.slides[this.index];
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

