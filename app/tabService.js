angular.module('blackInkApp').service('tabService', function ($q) {
    var _this = this;

    this.getSelectedTab = function() {
        var dfr = $q.defer();

        chrome.tabs.query({
            "active": true,
            "currentWindow": true
        }, function(tabs) {
            dfr.resolve(tabs[0]);
        });

        return dfr.promise;
    };

    this.validateTab = function(tab) {
        var dfr = $q.defer();
        var url = tab.url;

        if (url.indexOf("chrome://") === 0 || url.indexOf("chrome-extension://") === 0) {
            dfr.reject("Warning: Does not work on internal browser pages.");
        } else if (url.indexOf("https://chrome.google.com/extensions/") === 0 || 
            url.indexOf("https://chrome.google.com/webstore/") === 0) {
            dfr.reject("Warning: BlackInk does not work on the Chrome Pages.");
        } else {
            dfr.resolve(tab.id);
        }

        return dfr.promise;
    };

    this.loadScripts = function(tabid, scripts, dfr, self) {
        var scriptDesc = function(script) {
            return (
                script.file ? {
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

    this.sendMessage = function(message, callback) {
        chrome.tabs.getSelected(null, function(tab) {
            chrome.tabs.sendMessage(tab.id, message, callback);
        });
    };

    this.initTab = function(scripts) {
        dfr = $q.defer();
        _this.getSelectedTab().then(
            function(tab) {
                _this.validateTab(tab).then(
                    function(tabId) {
                        _this.loadScripts(tabId, scripts).then(
                            dfr.resolve()
                        );
                    },
                    function(err) {
                        if (err) {
                            console.log('getSelectedTab.error:', err);
                            console.error('getSelectedTab:', err);
                            dfr.reject(err);
                        } 
                    }
                );
            }
        );
        return dfr.promise;
    };


    // this.injectCss = function(contentDocument) {
    //     if(!contentDocument.getElementById("blackInkCss")) {
    //         this._injectCss('<link id="blackInkCss" rel="stylesheet" type="text/css" href="' + 
    //             chrome.extension.getURL('/inc/css/blackInkTab.css') + '" />');
    //     }
    // };

    // this._injectCss = function(css) {
    //     if ($$("head").length === 0) {
    //         $$("body").before(css);
    //     } else {
    //         $$("head").append(css);
    //     }
    // };
});