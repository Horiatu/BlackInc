angular.module('blackInkApp').service('blackInkStorage', function ($q) {
    var _this = this;
    //_this.Data = {};

    this.findAll = function(defaults) {
        //console.log("findAll",defaults);
        var defer = $q.defer();
        var data = Object.assign({}, defaults);
        chrome.storage.sync.get('blackInk', function(keys) {
            //console.log('keys', keys);
            forEachProp(keys, function(name, value) {
                forEachProp(value, function(k, v) {
                    data[k] = v;
                });
            });

            defer.resolve(data);
        });
        return defer.promise;
    };

    this.add = function (newValues) {
        var defer = $q.defer();

        //if(newValues=={}) return;
        // console.log('add', newValues, _this.Data);
        var changed = false;
        if(!_this.Data || _this.Data === undefined) _this.Data = {};
        forEachProp(newValues, function(prop, val) {
            if(!_this.Data[prop] || _this.Data[prop].toString() !== val.toString())
            {
                // console.log('Add:', prop, val, _this.Data[prop]);
                _this.Data[prop] = val;
                changed = true;
            }
        });
        
        if(changed) {
            _this.sync().then(
                function success(blackInkData) {
                    // console.log('Sync Updated:', blackInkData);
                    defer.resolve(true);
                },
                function error(err) {
                    defer.reject(err);
                }
            );
        }
        else {
            defer.resolve(false);
        }

        return defer.promise;
    };

    this.removeAll = function() {
        _this.Data = {};
        _this.sync();
        chrome.storage.sync.set({'blackInk': {}}, function() {
            console.log('Data in Chrome storage erased');
        });
    };

    this.sync = function() {
        var defer = $q.defer();
        // this.removeAll();
        // console.log('sync:', _this.Data);
        var data = Object.assign({}, _this.Data);
        chrome.storage.sync.set({'blackInk': data}, function() {
            chrome.storage.sync.get('blackInk', function(keys) {
                defer.resolve(keys.blackInk);
            });
        });
        return defer.promise;
    };

});