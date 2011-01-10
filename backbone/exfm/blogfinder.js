// @todo (lucas) Add default clean toStrings to Model and Collection 
// (like Sproutcore) instead of having to define the same thing every time.

$(function(){
    var _has_console = typeof console != 'undefined';
    var _alert_on_no_console = false;
    var _log = function(what){
        if(_has_console){
            console.log(what);
        }
        else if(_alert_on_no_console){
            alert(what);
        }
    };
    var _error = function(what){
        if(_has_console){
            console.error(what);
        }
        else if(_alert_on_no_console){
            alert('Error: '+what);
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
            if(!howmany){
                howmany = 1;
            }
            this.set({key: parseInt(this.get(key))+howmany});
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
    Backbone.ModelView = Backbone.View.extend({
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

    var Blog = Backbone.Model.extend({
        defaults: {
            'name': 'A blog',
            'url': 'http://www.ablog.com',
            'host': 'ablog.com',
            'count': 1,
            'artists': []
        },
        initialize: function(){
            this.set({'artists': new ArtistList,
                'host': _blog_host(this.get('url'))});
        },
        artistAppeared: function(artist){
            var _a = this.get('artists').contains('name', artist.get('name'));
            if(!_a){
                this.get('artists').add(artist);
            }
            this.increment('count', 1);
        }
    });
    
    var Artist = Backbone.Model.extend({
        defaults: {
            'name': 'An Artist',
            'image': '',
            'image_small': '',
            'playcount': 0,
            'blogs': [],
        },
        initialize: function() {
            this.set({'blogs': new BlogList});            
        }
    });
    
    var User = Backbone.Model.extend({
        defaults: {
            'username': 'A last.fm user',
            'image': '',
            'artists': [],
            'friends': [],
        },
        localStorage: new Store('lastfmuser'),
        initialize: function(){
            this.set({'artists': new ArtistList, 'friends': new FriendList});
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
            return -blog.get('artists').length;
        }
    });
    
    var ArtistList = Backbone.Collection.extend({
        model: Artist
    });
    
/////////////////////////////////////////////////
// Views
/////////////////////////////////////////////////    
    var TopBlogView = Backbone.ModelView.extend({
        tagname: "div",
        template: _.template($('#top-blog-template').html()),
        artistTemplate: _.template($('#top-blog-artist-template').html()),
        artistList: null,
        initialize: function(opts){
            _.bindAll(this, 'render', 'renderArtist');
            this.model.bind('change', this.render);
            this.model.view = this;
        },
        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            if(!this.artistList){
                this.artistList = $(this.el).find('ul');
            }
            this.model.get('artists').each(this.renderArtist);
            return this;
        },
        renderArtist: function(artist){
            this.artistList.append(this.artistTemplate(artist.toJSON()));
        }
    });
    
    var FriendView = Backbone.ModelView.extend({
        tagname: "div",
        template: _.template($('#friend-template').html()),
    });
    
    var BlogFinderView = Backbone.View.extend({
        el: $("#blogfinderapp"),
        _controller_listener: null,
        events: {
          "submit #lastfm-form":  "submitLastfmForm",
        },
        initialize: function(opts) {
          _log('BlogFinderView#initialize');
          this._user = opts._user;
          
          _.bindAll(this, 'friendsRefreshed');
          this._user.get('friends').bind('refresh', this.friendsRefreshed);
        },
        lastfmUser: function(username, period){
            if($('#intro').is(':visible')){
                $('#intro').hide();
            }
            if(!$('#container').is(':visible')){
                $('#container').show();
            }
            
            $('#filter a').removeClass('active');
            $('#filter').find('a[rel='+period+']').addClass('active');
            $('#filter a').each(function(){
                $(this).attr('href', '#lastfm/'+username+'/'+$(this).attr('rel'));
            });
        },
        submitLastfmForm: function(e){
            var username = this.valor($('#username'), 'lucius910');
            this.redirect('lastfm/'+username);
            return false;
        },
        blogsSorted: function(blogs){
            _log('BlogFinderView#blogsSorted');
            var _topBlogs = blogs.models;
            var el = $('#top-blogs');
            el.html('');
            var tpl = _.template($('#top-blog-template').html());
            _.each(_topBlogs, function(top){
                var view = new TopBlogView({model: top});
                el.append(view.render().el);
            });
            var _b = $('#blognum');
            _b.html(blogs.length);
        },
        friendsRefreshed: function(){
            $('#friend-list').html('');
            this._user.get('friends').each(function(friend){
                var view = new FriendView({model: friend});
                $('#friend-list').append(view.render().el);
            });
        },
    });
    
/////////////////////////////////////////////////
// App Controller
/////////////////////////////////////////////////    
    var BlogFinder = Backbone.Controller.extend({
        initialize: function(){
            _.bindAll(this, '_artistsChanged', '_blogsChanged', '_blogAdded');
            this._user = new User;
            this._blogs = new BlogList;
            this._view = new BlogFinderView({_user: this._user});
            this._user.bind('change:artists', this._artistsChanged);
        },
        routes: {
            'lastfm/:username': 'lastfmUser',
            'lastfm/:username/:period': 'lastfmUser',
        },
        lastfmUser: function(username, period){
            _log('BlogFinder#lastfmUser called');
            period = period || '3month';
            
            this._blogs = new BlogList;
            this._user.set({'username': username, 'artists': new ArtistList});
            this._fetchUserTopArtists(period);
            this._fetchUserFriends();
            
            this._view.lastfmUser(username, period);
            this.saveLocation('lastfm/'+username+'/'+period);
        },
        _artistsChanged: function(){
            _log('User artists changed!');
            var _app = this;
            _.each(this._user.get('artists'), function(artist){
                artist.get('blogs').bind('refresh', _app._blogsChanged);
                _app._fetchBlogsForArtist(artist);
            });
        },
        _blogsChanged: function(blogs){
            blogs.each(this._blogAdded);
            this._blogs.sort();
            this._view.blogsSorted(this._blogs);
        },
        _blogAdded: function(blog){
            var _b = this._blogs.contains('host', blog.get('host'));
            if(!_b){
                this._blogs.add(blog);
            }
            else{
                blog.get('artists').each(function(artist){
                    _b.artistAppeared(artist);
                });
            }
        },
        _fetchUserTopArtists: function(period){
            _log('BlogFinder#_fetchUserTopArtists: '+period);
            period = period || '3month';
            var _user = this._user;
            $.ajax({
                url: 'http://ws.audioscrobbler.com/2.0/',
                data: {
                    'user': _user.get('username'), 
                    'api_key': LASTFM_API_KEY, 
                    'format': 'json', 
                    'limit': 25, 
                    'method': 'user.gettopartists',
                    'period': period
                },
                dataType:'jsonp',
                success:function(data){
				    _user.set({'artists': 
				        _.map(data.topartists.artist, function(a){
				            return new Artist({'name': a.name, 
    				            'playcount': a.playcount, 
    				            'image': a.image[3]['#text'],
    				            'image_small': a.image[1]['#text']});
    				    })
				    });
               	},
			    error:function(e){
            		_error(e);
			    }
            });
        },
        _fetchUserFriends: function(){
            var user = this._user;
            $.ajax({
                url: 'http://ws.audioscrobbler.com/2.0/',
                data: {
                    'user': user.get('username'), 
                    'api_key': LASTFM_API_KEY, 
                    'format': 'json', 
                    'limit': 25, 
                    'method': 'user.getfriends'
                },
                dataType:'jsonp',
                success:function(data){
                    user.get('friends').refresh(_.map(data.friends.user, function(f){
                        return new Friend({'username': f.name, 
                            'image': f.image[0]['#text'], 
                            'realname': f.realname})
                    })).sort();
                }
            });
        },
        _fetchBlogsForArtist: function(artist){
            var artist = artist;
            $.ajax({
                url: 'http://developer.echonest.com/api/v4/artist/blogs',
                data: {
                    'format':'jsonp', 
                    'name': artist.get('name'), 
                    'results':'15',
                    'start': 0,
                    'api_key': 'N6E4NIOVYMTHNDM8J',
                },
                dataType : 'jsonp',
                success:function(data){
                    if(data.response.status.code != 0){
                        _error('BlogFinder#_fetchBlogsForArtist: Error fetching blogs '+data.response.status.message);
                        artist.set({'blogs': new BlogList});
                        return;
                    }
                    _log('BlogFinder#_fetchBlogsForArtist: Fetched '+data.response.blogs.length+' blogs');
                    var _blogs = [];
                    var _hosts = [];
                    if(data.response.blogs){   
                        _.each(data.response.blogs, function(blog){
                            var _host = _blog_host(blog.url);
                            if(_host == 'last.fm'){
                                _log('Skipping last.fm journal post');
                                return;
                            }
                            var existing_blog = _.pluck(_blogs, 'host').indexOf(_host);
                            var _blog = null;
                            
                            if(existing_blog > -1){
                                _blog = artist.get('blogs').at(existing_blog);
                            }
                            else {
                                _blog = new Blog({'name': blog.name, 'url': blog.url});
                                _blogs.push(_blog);
                            }
                            _blog.artistAppeared(artist);
                        });
                        
                    }
                    artist.get('blogs').refresh(_blogs);
                }
            });
        },
    });
        
    window.App = new BlogFinder();
    Backbone.history.start();
});
