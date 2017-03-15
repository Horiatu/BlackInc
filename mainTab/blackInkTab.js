console.log('blackInkTab.js loaded');

// injectCss = function() {
//     if(!document.getElementById("blackInkCss")) {
//         this._injectCss('<link id="blackInkCss" rel="stylesheet" type="text/css" href="' + 
//             chrome.extension.getURL('/mainTab/blackInkTab.css') + '" />');
//     }
// };

injectCss = function(id, css) {
	var element = document.getElementById(id);
	if(element) {
		element.parentNode.removeChild(element);
	}
    if ($("head").length === 0) {
        $("body").before(css);
    } else {
        $("head").append(css);
    }
};

// injectCss();

 injectCss("BlackInkColor", '<style id="BlackIncColor" class="BlackInc">* {color:black !important;}</style>');