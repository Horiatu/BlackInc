angular.module('blackInkApp').service('blackInkStorage', function ($q) {
    var _this = this;
    //_this.Data = {};

    this.findAll = function(defaults) {
        //console.log("findAll",defaults);
    	var defer = $q.defer();
      	var data = Object.assign({}, defaults);
    	chrome.storage.sync.get('blackInk', function(keys) {
            //console.log('keys', keys);
        	keys.forEachProp(function(name, value) {
        		value.forEachProp(function(k, v) {
                    //console.log('--'+k+':',v);
        			if((k == 'Sunrise' || k == 'Sunset') && v && (typeof v == 'string')) {
                        v = new Date(v);
                    }
	     		 	data[k] = v;
         		});
         	});

         	defer.resolve(data);
        });
        return defer.promise;
    };

    this.add = function (newValues) {
    	if(newValues=={}) return;
    	// console.log('add', newValues, _this.Data);
    	var changed = false;
    	if(!_this.Data || _this.Data === undefined) _this.Data = {};
        newValues.forEachProp(function(prop, val) {
        	if(!_this.Data[prop] || _this.Data[prop].toString() !== val.toString())
        	{
        		_this.Data[prop] = val;
        		changed = true;
        	}
        });
    	
        _this.sync(changed);
    };

    this.removeAll = function() {
        _this.Data = {};
        // _this.sync();
        chrome.storage.sync.set({'blackInk': {}}, function() {
            console.log('Data in Chrome storage erased');
        });
    };

    this.sync = function(update) {
        //this.removeAll();
    	// console.log('update:', update);
    	if(!update) return;
    	//_this.Data.date = new Date().toLocaleTimeString();
        chrome.storage.sync.set({'blackInk': _this.Data}, function() {
            console.log('Data is stored in Chrome storage');
            chrome.storage.sync.get('blackInk', function(keys) {
        		console.log('Sync:', keys.blackInk);
        	});
        });
    };


});