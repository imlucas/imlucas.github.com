$(function(){
    var _log = function(what){
        console.log(arguments);
    };
    
    var images = ['http://userserve-ak.last.fm/serve/_/489876.jpg', 'http://upload.wikimedia.org/wikipedia/commons/0/03/Gogol_Bordello_at_the_Aggie_Theatre.jpg'];
    _.each(images, function(i){
        var _i = new Image();
        _i.src = i;
    });
    window.images = images;
    var height = $(window).height();
    var width = $(window).width();
    window.width = width;
    
    var src = images[0];
    var img = new Image();
    img.src = src;
    window.img = img
    $(img).load(function(){
        _log(this.height);
    });
    var transitionTime = 10000;
    var img_height = 768;
    var img_width = 1024;
    
    window.last_direction = 'left';
    window.currentIndex = 0;
    var endCb = function(){
        if(currentIndex==window.images.length){
            window.currentIndex = 0;
        }
        var img = new Image();
        img.src = window.images[window.currentIndex];
        _log(currentIndex);
        _log(window.images);
        window.image = r.image(img.src, width, height/2-img_height/2, img_width, img_height);
        if(window.last_direction=='left'){
            window.last_direction = 'right';
            window.image.animate({x: width, y: -100}, transitionTime, endCb);
        }
        else{
            window.last_direction = 'left';
            window.image.animate({x: -img_width, y: 100}, transitionTime, endCb);
        }
        window.currentIndex++;
    }
    var r = Raphael("holder", width, height);
    window.image = r.image(img.src, width, height/2-img_height/2, img_width, img_height);
    window.image.animate({x: -width}, transitionTime, endCb);
    //r.image(img.src, 140, 740, 800, 600).scale(1, -1).attr({opacity: .5});
    //r.rect(0, 740, 600, 160).attr({gradient: "90-#000-#000", opacity: .5});
});