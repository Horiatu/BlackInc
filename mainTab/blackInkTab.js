console.log('blackInkTab.js loaded');

injectCss = function() {
    if(!document.getElementById("blackInkCss")) {
        this._injectCss('<link id="blackInkCss" rel="stylesheet" type="text/css" href="' + 
            chrome.extension.getURL('/mainTab/blackInkTab.css') + '" />');
    }
};

_injectCss = function(css) {
    if ($("head").length === 0) {
        $("body").before(css);
    } else {
        $("head").before(css);
    }
};

injectCss();