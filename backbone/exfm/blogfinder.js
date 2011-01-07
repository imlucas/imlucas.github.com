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
    var _redirect = function(where){
        window.location.hash = where;
    };
    
    var _blog_host = function(url){
        var pathArray = url.split( '/' );
        var host = pathArray[2];                        
        host = host.replace('www.', '');
        return host;
    };
    
    var LASTFM_API_KEY = 'f14983361e74e0e616d6f097c01d0863';
    
    
    var User = Backbone.Model.extend({
        defaults: {
            'username': 'A last.fm user',
            'image': '',
            'artists': [],
            'friends': [],
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
				        var artist = new Artist;
				        artist.set({'name': a.name, 'playcount': a.playcount, 'image': a.image[3]['#text']});
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
            'count': 0,
            'artists': []
        },
        initialize: function(){
            this.set({'artists': new ArtistList, 'cId': this.cid, 
                'host': _blog_host(this.get('url'))});
            
        },
        artistAppeared: function(artist){
            //this.get('artists').add(artist);
            this.count += 1;
        },
        toString: function(){
            return "Blog({name:'"+this.get('name')+"'})";
        }
    });
    
    Backbone.Collection = Backbone.Collection.extend({
        contains: function(key, value){
            var index = this.pluck(key).indexOf(value);
            return (index > -1) ? this.at(index) : null;
        }
    });
    
    var BlogList = Backbone.Collection.extend({
        model: Blog,
        comparator: function(blog){
            return -blog.get('count');
        },
        toString: function(){
            return "BlogList(["+ this.map(function(b){return b.toString()}) +"])";
        }
    });
    
    var ArtistBlogView = Backbone.Collection.extend({
        tagname: "li",
        template: _.template($('#artist-blog-template').html()),
        initialize: function(opts){
            _.bindAll(this, 'render');
            this.blogModel = opts.blogModel;
            this.blogModel.bind('change', this.render);
            this.blogModel.view = this;
            
        },
        render: function() {
            _log('ArtistBlogView#render');
            var h = this.template(this.blogModel.toJSON());
            $(this.el).html(h);
            return h;
        },
        remove: function() {
            $(this.el).remove();
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
        clear: function() {
          this.view.remove();
        },
        fetchBlogs: function(){
            _log('Artist#fetchBlogs: '+this);
            var _artist = this;
            $.ajax({
                'url': 'http://developer.echonest.com/api/v4/artist/blogs',
                'data': {'format':'jsonp', 
                    'name': this.get('name'), 
                    'results':'15',
                    'start': 0,
                    'api_key': 'N6E4NIOVYMTHNDM8J',
                },
                'success':function(data){
                    _log('Artist#fetchBlogs: Fetched '+data.response.blogs.length+' blogs');
                    var _blogs = [];
                    var _hosts = [];
                    if(!data.response.blogs){
                        return;
                    }
                    _.each(data.response.blogs, function(blog){
                        var _host = _blog_host(blog.url);
                        var existing_blog = _artist.get('blogs').contains('host', _host);
                        var _blog = null;
                        
                        if(existing_blog){
                            _blog = existing_blog;
                        }
                        else {
                            _blog = new Blog({'name': blog.name, 'url': blog.url});
                            _log('Artist#fetchBlogs: Add blog: '+_blog);
                            _artist.get('blogs').add(_blog);
                        }
                        _blog.artistAppeared(_artist);
                        
                    });
                    
                    _artist.view.renderBlogs();
                },
                'dataType' : 'jsonp',
                'artistName':this.get('name')
            });
            
            
        },
        toString: function(){
            return "Artist({name:'"+this.get('name')+"'})";
        }
    });
    
    
    var ArtistList = Backbone.Collection.extend({
        model: Artist,
        comparator: function(artist) {
          return -artist.get('playcount');
        }
    });

    var ArtistView = Backbone.View.extend({
        tagName:  "div",
        template: _.template($('#artist-template').html()),
        initialize: function(){
          _.bindAll(this, 'renderBlogs');
          
          this.model.bind('change', this.render);
          this.model.view = this;
        },
        render: function() {
          $(this.el).html(this.template(this.model.toJSON()));
          return this;
        },
        remove: function() {
          $(this.el).remove();
        },
        renderBlogs: function(){
            _log('ArtistView#renderBlogs: '+this.model.get('blogs'));
            var _b = $(this.el).find('.blogs');
            var _blog_list = _b.find('ul');
            this.model.get('blogs').each(function(blog){
                var view = new ArtistBlogView({blogModel: blog});
                var e = view.render();
                _blog_list.append(e); // @todo (lucas) Slow.
            });
            _b.removeClass('loading');
            return this;
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
          
          window.Blogs = new BlogList;
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
        
        lastfmUser: function(username, filter){},
        
        showResults: function(){
            _log('BlogFinderView show results called.');
            
            if($('#intro').is(':visible')){
                $('#intro').hide();
            }
            if(!$('#container').is(':visible')){
                $('#container').show();
            }
        },
        submitLastfmForm: function(e){
            var username = $(e.target).find('input[type=text]').val();
            if(username==''){
                username = 'lucius910';
            }
            
            _redirect('lastfm/'+username);
            
            _log('done with submit.  returing false to stop prop.');
            return false;
        },
    });
    
    var BlogFinder = Backbone.Controller.extend({
        initialize: function(){
            this._view = new BlogFinderView;
            this._user = null;
        },
        routes: {
            'lastfm/:username': 'lastfmUser',
            'lastfm/:username/:period': 'lastfmUser',
        },
        setArtists: function(artists){
            _log('BlogFinder#setArtists called');
            _.each(artists, function(artist){
                _log('Adding artist to collection.');
                window.Artists.add(artist);
                artist.fetchBlogs();
            });
            this._view.addAll(); 
        },
        lastfmUser: function(username, period){
            _log('BlogFinder#lastfmUser called');
            if(!period){
                period = '3month';
            }
            _log('calling show results')
            this._view.showResults();
            _log('saving location');
            
            this._user = new User;
            this._user.set({'username': username});
            this._user.getTopArtists(period);
            
            var _app = this;
            
            this._user.bind('change:artists', function(){
                _log('User artists changed!');
                _app.setArtists(_app._user.get('artists'));
            });
            
            this.saveLocation('lastfm/'+username+'/'+period);
        }
    });
  

    
    window.App = new BlogFinder();
    Backbone.history.start();
});
