angular.module('blackInkApp').service('tabService', function ($q) {
    var _this = this;

    this.getSelectedTab = function() {
        var dfr = $q.defer();

        chrome.tabs.query({ active: true }, function(tabs) {
            // console.log("tabs: ",tabs);
            dfr.resolve(tabs[0]);
        });
        return dfr.promise;
    };

    this.validateTab = function(tab) {
        var dfr = $q.defer();
        var url = tab.url;
        var reject = function(err) {
            err = "BlackInc Little - Warning!\n"+err;
            dfr.reject(err);
            console.error('validateTab:', err);
            chrome.browserAction.setTitle({
                title: err,
                tabId: tab.id
            });
            chrome.browserAction.disable(tab.id);
        };
        if (url.indexOf("chrome://") === 0 || url.indexOf("chrome-extension://") === 0) {
            reject("Does not work on internal browser pages.");
        } else if (url.indexOf("https://chrome.google.com/extensions/") === 0 || 
            url.indexOf("https://chrome.google.com/webstore/") === 0) {
            reject("Does not work on the Chrome Pages.");
        } else {
            chrome.browserAction.enable(tab.id);
            dfr.resolve(tab.id);
        }

        return dfr.promise;
    };

    this.loadScripts = function(tabid, scripts, dfr, self) {
        var scriptDesc = function(script) {
            return (
                script.file ? 
                {
                    allFrames: script.allFrames,
                    "file": script.content
                } : 
                {
                    allFrames: script.allFrames,
                    "code": script.content
                }
            );
        };

        if(!dfr)
        {
            dfr = $q.defer();
        }
        if(!self) {
            self = _this;
        }
        var options = scriptDesc(scripts.shift());
        chrome.tabs.executeScript(tabid, options, function() {
            if (scripts.length !== 0)
            {
                self.loadScripts(tabid, scripts, dfr);   
            }
            else 
            {
                dfr.resolve();
            }
        });
        return dfr.promise;
    };

    this.sendMessage = function(tabId, message, callback) {
        chrome.tabs.sendMessage(tabId, message, callback);
    };

    this.initTab = function(scripts) {
        dfr = $q.defer();
        this.getSelectedTab().then(
            function(tab) {
                _this.validateTab(tab).then(
                    function(tabId) {
                        _this.loadScripts(tabId, scripts).then(
                            dfr.resolve(tabId)
                        );
                    },
                    function(err) {
                        if (err) {
                            dfr.reject(err);
                            console.err('TabService::initTab', err);
                        } 
                    }
                );
            }
        );
        return dfr.promise;
    };
});