var Artist = Backbone.Model.extend({
    defaults: {
        'name': 'An Artist',
        'image': 'images/loading.gif'
    }
});

var ArtistList = Backbone.Collection.extend({model: Artist});

var User = Backbone.Model.extend({
    defaults: {
        'username': 'A User',
        'topArtists': new ArtistList
    }
});

var ArtistView = Backbone.View.extend({
    tagname: 'div',
    className: 'artist',
    template: _.template($('#artist-template').html()),
    initialize: function(){
        this.model.bind('change', this.render);
        this.model.view = this;
    },
    render: function(){
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }
});

var AppView = Backbone.View.extend({
    el: $('#app'),
    artistsContainer: $('#artists'),
    events: {
        'submit #lastfm-form':'formSubmitted'
    },
    initialize: function(opts){
        this.user = opts.user;
        _.bindAll(this, 'artistAdded', 'usernameChanged');
        this.user.get('topArtists').bind('add', this.artistAdded);
        this.user.bind('change:username', this.usernameChanged);
    },
    artistAdded: function(artist){
        console.log('Artist added')
        var view = new ArtistView({model: artist});
        this.artistsContainer.append(view.render().el);
    },
    formSubmitted: function(){
        window.location.hash = 'lastfm/'+$(this.el).find('input[type=text]').val();
        return false;
    },
    usernameChanged: function(){
        $(this.el).find('input[type=text]').val(this.user.get('username'));
    }
});

var AppController = Backbone.Controller.extend({
    routes: {
        'lastfm/:username': 'lastfmUser'
    },
    initialize: function(){
        this.user = new User;
        this.view = new AppView({user: this.user});
        Backbone.history.start();
    },
    lastfmUser: function(username){
        this.user.set({'username': username});
        this.user.get('topArtists').refresh([]);
        this.fetchUserTopArtists();
    },
    fetchUserTopArtists: function(){
        var app = this;
        $.ajax({
            url: 'http://ws.audioscrobbler.com/2.0/',
            data: {
                'user': app.user.escape('username'), 
                'api_key': 'f14983361e74e0e616d6f097c01d0863', 
                'format': 'json', 
                'limit': 25, 
                'method': 'user.gettopartists',
            },
            dataType:'jsonp',
            success:function(data){
                _.each(data.topartists.artist, function(lastfmArtist){
                    var artist = new Artist({'name': lastfmArtist.name, 'image': lastfmArtist.image[3]['#text']});
                    app.user.get('topArtists').add(artist);
                });
            }
        });
    }
});