var http = require('http'),
    parseUrl = require('url').parse;


// Lucass-MacBook-Air:go lucas$ time node checker.js
// [ { url: 'http://www.tumblr.com/audio_file/someonesinthewolf/8755310631/tumblr_lpkxbfQrNr1qbpu1l',
//     exists: false },
//   { url: 'http://www.tumblr.com/audio_file/someonesinthewolf/8755310631/tumblr_lpkxbfQrNr1qbpu1l?plead=please-dont-download-this-or-our-lawyers-wont-let-us-host-audio',
//     exists: false } ]

// real    0m0.185s
// user    0m0.085s
// sys 0m0.020s

function loadUrls(cb){
    var urls = ["http://www.tumblr.com/audio_file/someonesinthewolf/8755310631/tumblr_lpkxbfQrNr1qbpu1l?plead=please-dont-download-this-or-our-lawyers-wont-let-us-host-audio", "http://www.tumblr.com/audio_file/someonesinthewolf/8755310631/tumblr_lpkxbfQrNr1qbpu1l"];
    cb(urls);
}

function check(url, cb){
    var info = parseUrl(url),
            opts = {
            'method': 'HEAD',
            'port': 80,
            'host': info.host,
            'path': info.path
        };
    http.request(opts, function(res){
        cb(url, (res.statusCode === 200));
    }).end();
}

var res = [],
    remaining;

function done(){
    console.log(res);
}

loadUrls(function(urls){
    remaining = urls.length;
    urls.forEach(function(url){
        check(url, function(url, exists){
            res.push({'url': url, 'exists': exists});
            remaining--;
            if(remaining === 0){
                done();
            }
        });
    });
});