angular.module('blackInkApp').service('tabService', function ($q) {
    var _this = this;

    this.getSelectedTab = function() {
        var dfd = $q.defer();

        chrome.tabs.query({
            "active": true,
            "currentWindow": true
        }, function(tabs) {
            dfd.resolve(tabs[0]);
        });

        return dfd.promise();
    };

    this.validateTab = function(tab) {
        var dfd = $q.defer();
        var url = tab.url;

        if (url.indexOf("chrome://") === 0 || url.indexOf("chrome-extension://") === 0) {
            dfd.reject("Warning: Does not work on internal browser pages.");
        } else if (url.indexOf("https://chrome.google.com/extensions/") === 0 || url.indexOf("https://chrome.google.com/webstore/") === 0) {
            dfd.reject("Warning: Does not work on the Chrome Extension Gallery.");
        } else {
            dfd.resolve();
        }

        return dfd.promise();
    };

    this.injectCss = function(contentDocument) {
        // var _injectCss = function(css) {
        //     if ($("head").length === 0) {
        //             $("body").before(css);
        //         } else {
        //             $("head").append(css);
        //         }
        // };

        // if(!contentDocument.getElementById("colorPickerCss")) {
        //     _injectCss('<link id="colorPickerCss" rel="stylesheet" type="text/css" href="' + 
        //         chrome.extension.getURL('/inc/css/ColorPicker.css') + '" />');
        // }
    };

});