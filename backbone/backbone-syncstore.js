// Based on Backbone.localStorage.
// Idea is when offline, write to localstorage 
// and queue changes to send to the remote when 
// we come back online.
//
// @todo (lucas) Implement rev-ish tracking and 
// first in conflict resolution ala couch.  
//
// @todo (lucas) Throttle repl calls?
//
// @todo (lucas) Use guids like sproutcore instead of ID's?
//


// Generate a pseudo-GUID by concatenating random hexadecimal.
function guid() {
    // Generate four random hex digits.
    var s4 = function(){
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
};

Backbone.SynchStore = function(name, options){
    this.name = name;
    this.continuous = options.continuous || false;

    var store = localStorage.getItem(this.name);
    this.records = (store && store.split(',')) || [];

    this.replStore = localStorage.getItem(this.name+'-repl');
    this.replQueue = (this.replStore && this.replStore.split(',')) || [];

    _.bindAll(this, '_onOnline', 'onOffline');
    this.online = navigator.onLine;
    
    // Should the local version be considered dirty (items in the queue we 
    // haven't sent yet). 
    this.dirty = this.replQueue.length > 0;
    if(this.online && this.dirty){
        this.replicate();
    }
};
_.extend(Backbone.OfflineStore.prototype, Backbone.Events, {
    // Connectivity restored.  Replicate to remote.
    _onOnline: function(){
        this.online = true;
        if(this.online && this.dirty){
            this.replicate();
        }
    },
    // Lost the mother ship.  Start queueing to local storeage.
    _onOffline: function(){
        this.online = false;
    },
    
    // Start replicating to the remote (push/pull).
    // Post local changes and load back current state 
    // into the model.
    replicate: function(){
        
    },
    enqueue: function(op, model){
        // Write queued item to local storage.
        localStorage.setItem(this.name+'-repl', this.replQueue.join(","));
    },
    // Delete old revs (postsgres style) from localStorage.
    vaccum: function(){
        
    },
    // Write the records to local storage.
    save: function(){
        localStorage.setItem(this.name, this.records.join(","));
    },
    // Push a model into the local storage.
    create: function(model){
        if (!model.id){
            model.id = model.attributes.id = guid();
        }
        localStorage.setItem(this.name+"-"+model.id, JSON.stringify(model));
        this.records.push(model.id.toString());
        this.save();
        return model;
    },
    // Update a model by replacing its copy in `this.data`.
    update: function(model) {
        localStorage.setItem(this.name+"-"+model.id, JSON.stringify(model));
        if (!_.include(this.records, model.id.toString())){
            this.records.push(model.id.toString()); 
        }
        this.save();
        return model;
    },

    // Retrieve a model from `this.data` by id.
    find: function(model) {
        return JSON.parse(localStorage.getItem(this.name+"-"+model.id));
    },

    // Return the array of all models currently in storage.
    findAll: function() {
        return _.map(this.records, function(id){
            return JSON.parse(localStorage.getItem(this.name+"-"+id));
        }, this);
    },

    // Delete a model from `this.data`, returning it.
    destroy: function(model) {
        localStorage.removeItem(this.name+"-"+model.id);
        this.records = _.reject(this.records, function(record_id){
            return record_id == model.id.toString();
        });
        this.save();
        return model;
    }
});

// Override `Backbone.sync` to use delegate to the model or collection's
// *localStorage* property, which should be an instance of `Store`.
Backbone.sync = function(method, model, options) {
    var resp;
    var store = model.storage || model.collection.storage || null;
    if(!store){
        throw("Model has no storage defined.");
    }
    switch (method) {
        case "read":    
            resp = model.id ? store.find(model) : store.findAll(); 
        break;
        case "create":  
            resp = store.create(model);                            
        break;
        case "update":  
            resp = store.update(model);                            
        break;
        case "delete":  
            resp = store.destroy(model);                           
        break;
    }

    // Queue the model op.
    store.enqueue(method, model);
  
  if (resp) {
      options.success(resp);
  } 
  else {
      options.error("Record not found");
  }
};