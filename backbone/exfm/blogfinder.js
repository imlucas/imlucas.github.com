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
    
    var BlogPost = Backbone.Model.extend({
        defaults: {'title': 'Post Title', 'url': '', 'host': ''},
    });
    
    var Blog = Backbone.Model.extend({
        defaults: {
            'name': 'A blog',
            'url': 'http://www.ablog.com',
            'host': 'ablog.com',
            'count': 1,
            'postCount': 1,
            'artists': []
        },
        initialize: function(){
            this.set({'artists': new ArtistList, 'cId': this.cid, 
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
            this.set({'blogs': new BlogList, 'cId': this.cid});            
        },
        toString: function(){
            return "Artist({name:'"+this.get('name')+"'})";
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
            //return blog.get('host');
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
            _log(this.model.get('artists'));
            this.model.get('artists').each(this.renderArtist);
            return this;
        },
        renderArtist: function(artist){
            this.artistList.append(this.artistTemplate(artist.toJSON()));
        },
        
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
          this.model.get('blogs').bind('refresh', this.renderBlogs);
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
            _blog_list.html('');
            this.model.get('blogs').each(function(blog, index){
                blog.set({'index': index});
                var view = new ArtistBlogView({model: blog});
                _blog_list.append(view.render().el); // @todo (lucas) Slow.
            });
            if(this.model.get('blogs').length > 3){
                _b.find('div.more').show();
            }
            _b.removeClass('loading').addClass('loaded');
            if(this.model.get('blogs').length < 1){
                $(this.el).find('.blog-list em').html('No blogs :(');
            }
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
        initialize: function(opts) {
          _log('BlogFinderView#initialize');
          this._user = opts._user;
          _.bindAll(this, 'artistAdded', 'artistsRefreshed', 'render');
          this._user.get('artists').bind('add', this.artistAdded);
          this._user.get('artists').bind('refresh', this.artistsRefreshed);
          this._user.get('artists').bind('all', this.render);
        },

        render: function() {},
        artistAdded: function(artist) {
            _log('BlogFinderView#artistAdded: '+artist);
            var view = new ArtistView({model: artist});
            this.$("#artist-list").append(view.render().el);
        },

        artistsRefreshed: function() {
            _log('BlogFinderView#artistsRefreshed called');
            this.$("#artist-list").html('');
            _.each(this._user.get('artists'), this.artistAdded);
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
            _log('BlogFinderView#blogsSorted');
            var _topBlogs = blogs.models;
            var el = $('#top-blogs');
            el.html('');
            var tpl = _.template($('#top-blog-template').html());
            _.each(_topBlogs, function(top){
                var view = new TopBlogView({model: top});
                el.append(view.render().el);
            });
        }
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
        _artistsChanged: function(){
            _log('User artists changed!');
            var _app = this;
            _.each(this._user.get('artists'), function(artist){
                artist.get('blogs').bind('refresh', _app._blogsChanged);
                _app._fetchBlogsForArtist(artist);
            });
            //this._view.artistsRefreshed();
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
                this._view.addBlog(blog);
            }
            else{
                blog.get('artists').each(function(artist){
                    _b.artistAppeared(artist);
                });
            }
        },
        lastfmUser: function(username, period){
            _log('BlogFinder#lastfmUser called');
            if(!period){
                period = '3month';
            }
            this._blogs = new BlogList;
            this._user.set({'username': username, 'artists': new ArtistList});
            this._fetchUserTopArtists(period);
            this._view.lastfmUser(username, period);
            this.saveLocation('lastfm/'+username+'/'+period);
        },
        _fetchUserTopArtists: function(period){
            _log('BlogFinder#_fetchUserTopArtists: '+period);
            if(!period){
                period = '3month';
            }
            var _user = this._user;
            _log('BlogFinder#_fetchUserTopArtists: Getting top artists for '+_user.get('username'));
            $.ajax({
                data: 'user='+_user.get('username')+'&api_key='+LASTFM_API_KEY+'&format=json&limit=25&period='+period,
                url: 'http://ws.audioscrobbler.com/2.0/?method=user.gettopartists',
                dataType:'jsonp',
                processData:false,
                global:false,
                success:function(data){
                    _log('BlogFinder#_fetchUserTopArtists: Got data back from lastfm');
                    var artists = [];
				    _.each(data.topartists.artist, function(a){
				        var artist = new Artist({'name': a.name, 
				            'playcount': a.playcount, 
				            'image': a.image[3]['#text'],
				            'image_small': a.image[1]['#text']});
				            
				        artists.push(artist);
				    });
				    _log('BlogFinder#_fetchUserTopArtists: Setting artists to '+artists);
				    _user.set({'artists': artists});
               	},
			    error:function(e){
            		alert('Error');
			    }
            });
        },
        _fetchUserFriends: function(user){
            $.ajax({
                data: 'user='+user.get('username')+'&api_key='+LASTFM_API_KEY+'&format=json&limit=25',
                url: 'http://ws.audioscrobbler.com/2.0/?method=user.getfriends',
                dataType:'jsonp',
                processData:false,
                global:false,
                success:function(data){
                    var friends = [];
                    _.each(data.friends.user, function(f){
                        user.get('friends').add(new Friend({'username': f.username}));
                    });
                    user.get('friends').sort();
                }
            });
        },
        _fetchBlogsForArtist: function(artist){
            var artist = artist;
            $.ajax({
                'url': 'http://developer.echonest.com/api/v4/artist/blogs',
                'data': {'format':'jsonp', 
                    'name': artist.get('name'), 
                    'results':'15',
                    'start': 0,
                    'api_key': 'N6E4NIOVYMTHNDM8J',
                },
                'success':function(data){
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
                },
                'dataType' : 'jsonp',
                'artistName':artist.get('name')
            });
        },
    });
        
    window.App = new BlogFinder();
    Backbone.history.start();
});
