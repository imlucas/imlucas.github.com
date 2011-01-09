// @todo (lucas) Add default clean toStrings to Model and Collection 
// (like Sproutcore) instead of having to define the same thing every time.

$(function(){
    var _has_console = typeof console != 'undefined';
    var _alert_on_no_console = true;
    var _log = function(what){
        if(_has_console){
            console.log(what);
        }
        else if(_alert_on_no_console){
            alert(what);
        }
    };
    
    // Take a post URL and return the host sans www.
    var _blog_host = function(url){
        var pathArray = url.split( '/' );
        var host = pathArray[2];                        
        host = host.replace('www.', '');
        return host;
    };
    
    Backbone.Collection = Backbone.Collection.extend({
        // Get an object from the collection using an arbitrary key value pair.
        contains: function(key, value){
            var index = this.pluck(key).indexOf(value);
            return (index > -1) ? this.at(index) : null;
        }
    });
    
    Backbone.Model = Backbone.Model.extend({
        // Increment a member variable by <howmany>.  Howmany defaults to 1.
        increment: function(key, howmany){
            if(!howmnay){
                howmany = 1;
            }
            this.set(key, parseInt(this.get('key'))+howmany);
        }
    });
    
    Backbone.View = Backbone.View.extend({
        // Redirect to an arbitrary hash fragment.  Very useful for cleanly 
        // linking view events back to the controller level without a bunch of 
        // one of events.  Only useful if you're using routes in your controller.
        redirect: function(fragment){
            window.location.hash = fragment;
        },
        valor: function(j, _default){
            var _v = j.val();
            if(_v==''){
                _v = _default;
            }
            return _v;
        }
    });
    
    // Pretty much every model view has been EXACTLY the same except for the 
    // template and tage names used.  Just a little wrapper so you only have 
    // to define those.
    var Backbone.ModelView = Backbone.View.extend({
        initialize: function(opts){
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.model.view = this;
        },
        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },
        remove: function() {
            $(this.el).remove();
        }
    });
    
    var LASTFM_API_KEY = 'f14983361e74e0e616d6f097c01d0863';
    
/////////////////////////////////////////////////
// MODELS
/////////////////////////////////////////////////
    var Friend = Backbone.Model.extend({
        'username': 'A last.fm user',
        'image': '',
    });
    
    var User = Backbone.Model.extend({
        defaults: {
            'username': 'A last.fm user',
            'image': '',
            'artists': new ArtistList,
            'friends': new FriendList,
        },
        getTopArtists: function(period){
            if(!period){
                period = '3month';
            }
            var _user = this;
            _log('Getting top artists for '+_user.get('username'));
            $.ajax({
                data: 'user='+_user.get('username')+'&api_key='+LASTFM_API_KEY+'&format=json&limit=25&period='+period,
                url: 'http://ws.audioscrobbler.com/2.0/?method=user.gettopartists',
                dataType:'jsonp',
                processData:false,
                global:false,
                success:function(data){
                    _log('Got data back from lastfm');
                    var artists = [];
				    _.each(data.topartists.artist, function(a){
				        var artist = new Artist({'name': a.name, 
				            'playcount': a.playcount, 
				            'image': a.image[3]['#text']});
				            
				        artists.push(artist);
				    });
				    _log('Setting artists to '+artists);
				    _user.set({'artists': artists});
               	},
			    error:function(e){
            		alert('Error');
			    }
            });
        },
        getFriends: function(){
            var _user = this;
            $.ajax({
                data: 'user='+_user.get('username')+'&api_key='+LASTFM_API_KEY+'&format=json&limit=25',
                url: 'http://ws.audioscrobbler.com/2.0/?method=user.getfriends',
                dataType:'jsonp',
                processData:false,
                global:false,
                success:function(data){
                    // friends = data
                    _.each(data.friends.user, function(){
                        
                    });
                }
            });
        }
    });
    
    var Blog = Backbone.Model.extend({
        defaults: {
            'name': 'A blog',
            'url': 'http://www.ablog.com',
            'host': 'ablog.com',
            'count': 1,
            'artists': []
        },
        initialize: function(){
            this.set({'artists': new ArtistList, 'cId': this.cid, 
                'host': _blog_host(this.get('url'))});
        },
        artistAppeared: function(artist){
            var _a = this.get('artists').contains('name', artist.get('name'));
            (_a) ? _a.increment('postCount', 1) : this.get('artists').add(artist);
            this.increment('count', 1);
        },
        toString: function(){
            return "Blog({host:'"+this.get('host')+"'})";
        }
    });
    
    var Artist = Backbone.Model.extend({
        defaults: {
            'name': 'An Artist',
            'image': '',
            'playcount': 0,
            'blogs': [],
        },
        initialize: function() {
            this.set({'blogs': new BlogList, 'cId': this.cid});            
        },
        toString: function(){
            return "Artist({name:'"+this.get('name')+"'})";
        }
    });
    
/////////////////////////////////////////////////
// Collections
/////////////////////////////////////////////////    
    var FriendList = Backbone.Collection.extend({
        model: Friend,
        comparator: function(friend){
            return friend.get('username');
        }
    });
    
    var BlogList = Backbone.Collection.extend({
        model: Blog,
        comparator: function(blog){
            return -blog.get('count');
        }
    });
    
    var ArtistList = Backbone.Collection.extend({
        model: Artist,
        comparator: function(artist) {
          return -artist.get('playcount');
        }
    });
    
/////////////////////////////////////////////////
// Views
/////////////////////////////////////////////////    
    var TopBlogView = Backbone.ModelView.extend({
        tagname: "div",
        template: _.template($('#top-blog'))
    });
    
    var ArtistBlogView = Backbone.ModelView.extend({
        tagname: "li",
        template: _.template($('#artist-blog-template').html())
    });
    
    var ArtistView = Backbone.View.extend({
        tagName:  "div",
        template: _.template($('#artist-template').html()),
        initialize: function(){
          _.bindAll(this, 'renderBlogs', 'render');
          this.model.bind('change', this.render);
          this.model.view = this;
        },
        events: {
            "click .blogs .blog-list .more a": "_showMoreBlogs",
            "click .blogs .blog-list .less a": "_showLessBlogs"
        },
        render: function() {
          $(this.el).html(this.template(this.model.toJSON()));
          return this;
        },
        renderBlogs: function(){
            _log('ArtistView#renderBlogs');
            var _b = $(this.el).find('.blogs');
            var _blog_list = _b.find('ul');
            this.model.get('blogs').each(function(blog, index){
                blog.set({'index': index});
                var view = new ArtistBlogView({model: blog});
                var e = view.render();
                _blog_list.append(e); // @todo (lucas) Slow.
            });
            if(this.model.get('blogs').length > 3){
                _b.find('div.more').show();
            }
            _b.removeClass('loading').addClass('loaded');
            return this;
        },
        _showMoreBlogs: function(e){
            var el = $(this.el);
            el.find('li').show();
            el.find('.more').hide();
            el.find('.less').show();
        },
        _showLessBlogs: function(e){
            var el = $(this.el);
            el.find('li.bonus').hide();
            el.find('.more').show();
            el.find('.less').hide();
        }
    });
    
    var BlogFinderView = Backbone.View.extend({
        el: $("#blogfinderapp"),
        _controller_listener: null,
        events: {
          "submit #lastfm-form":  "submitLastfmForm",
        },
        initialize: function() {
          _log('BlogFinderView#initialize');
          _.bindAll(this, 'addOne', 'addAll', 'render');
          
          window.Artists = new ArtistList;
          
          Artists.bind('add', this.addOne);
          Artists.bind('refresh', this.addAll);
          Artists.bind('all', this.render);
          
        },

        render: function() {},

        addOne: function(artist) {
            _log('BlogFinderView#addOne: '+artist);
            var view = new ArtistView({model: artist});
            this.$("#artist-list").append(view.render().el);
        },

        addAll: function() {
            _log('BlogFinderView#addAll called');
            this.$("#artist-list").html('');
            Artists.each(this.addOne);
        },
        
        lastfmUser: function(username, period){
            if($('#intro').is(':visible')){
                $('#intro').hide();
            }
            if(!$('#container').is(':visible')){
                $('#container').show();
            }
        },
        submitLastfmForm: function(e){
            var username = this.valor($(e.target).find('input[type=text]'), 'lucius910');
            this.redirect('lastfm/'+username);
            return false;
        },
        addBlog: function(blog){
            var _b = $('#blognum');
            _b.html(parseInt(_b.html())+1);
        },
        blogsSorted: function(blogs){
            var _topBlogs = blogs.models.slice(0, 3);
            var el = $('#top-blogs');
            el.html('');
            _.each(_topBlogs, function(top){
                el.append('<div><a href="http://'+top.get('host')+'" target="_blank">'+top.get('host')+' ('+top.get('count')+')</a></div>');
            });
        }
    });
    
/////////////////////////////////////////////////
// App Controller
/////////////////////////////////////////////////    
    var BlogFinder = Backbone.Controller.extend({
        initialize: function(){
            _.bindAll(this, '_artistsChanged', '_blogAdded');
            this._user = null;
            this._blogs = new BlogList;
            
            this._view = new BlogFinderView();
            this._user.bind('change:artists', '_artistsChanged');
            
        },
        routes: {
            'lastfm/:username': 'lastfmUser',
            'lastfm/:username/:period': 'lastfmUser',
        },
        _artistsChanged: function(){
            _log('User artists changed!');
            var _app = this;
            _.each(artists, function(artist){
                _log('Adding artist to collection.');
                artist.get('blogs').bind('add', function(blog){
                    _app._blogAdded(blog);
                });
                _app._artists.add(artist);
                _app._fetchBlogsForArtist(artist);
            });
            this._view.addAll();
        },
        _blogAdded: function(blog){
            _log('BlogFinder#_blogAdded');
            var _b = this._blogs.contains('host', blog.get('host'));
            
            if(!_b){
                _log('BlogFinder#_blogAdded: Dont have that one yet...');
                this._blogs.add(blog);
                this._view.addBlog(blog);
            }
            else{
                var v = _b.get('count');
                _b.set({'count': v+1});
                _log('BlogFinder#_blogAdded: inc to '+(v+1));
            }
            
            this._blogs.sort();
            this._view.blogsSorted(this._blogs);
        },
        lastfmUser: function(username, period){
            _log('BlogFinder#lastfmUser called');
            if(!period){
                period = '3month';
            }
            this._view.showResults();
            this._user = new User({'username': username});
            this.saveLocation('lastfm/'+username+'/'+period);
        },
        _fetchBlogsForArtist: function(artist){
            $.ajax({
                'url': 'http://developer.echonest.com/api/v4/artist/blogs',
                'data': {'format':'jsonp', 
                    'name': artist.get('name'), 
                    'results':'15',
                    'start': 0,
                    'api_key': 'N6E4NIOVYMTHNDM8J',
                },
                'success':function(data){
                    _log('Artist#fetchBlogs: Fetched '+data.response.blogs.length+' blogs');
                    var _blogs = [];
                    var _hosts = [];
                    if(data.response.blogs){   
                        _.each(data.response.blogs, function(blog){
                            var _host = _blog_host(blog.url);
                            if(_host == 'last.fm'){
                                _log('Skipping last.fm journal post');
                                return;
                            }
                            
                            var existing_blog = _artist.get('blogs').contains('host', _host);
                            var _blog = null;
                            
                            if(existing_blog){
                                _blog = existing_blog;
                            }
                            else {
                                _blog = new Blog({'name': blog.name, 'url': blog.url});
                                _log('Artist#fetchBlogs: Add blog: '+_blog);
                                artist.get('blogs').add(_blog);
                            }
                            _blog.artistAppeared(_artist);
                        
                        });
                    }
                    artist.view.renderBlogs();
                },
                'dataType' : 'jsonp',
                'artistName':artist.get('name')
            });
            
            
        },
    });
  

    
    window.App = new BlogFinder();
    Backbone.history.start();
});
