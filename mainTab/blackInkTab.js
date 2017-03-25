console.log('blackInkTab.js loaded');

init = function() {
    chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
        switch (req.type) {
        	case 'css':
	        	var cssId = req.cssId || "BlackInkColor";
        		injectCss(req.cssId, req.cssContent);
        		break;
            case 'invert':
                switch(req.mode) {
                    case false :
                        $('html').removeClass("InvertVision");
                        break;
                    case true :
                        $('html').addClass("InvertVision");
                        break;
                }
                break;
        }
    });

    if(!document.getElementById("PickerOvr")) {
        $("body").append('<div id="PickerLdr"></div>');
        $("#PickerLdr").append('<div id="PickerOvr" style="display:none; cursor: url(' + 
        	chrome.extension.getURL("images/cursors/pickColor.cur") + '), crosshair !important; '+
        	'width: 100%; height: 100%; position: absolute; top: 0; left: 0;"></div>');
    }

    var _injectCss = function(css) {
        if ($("head").length === 0) {
            $("body").before(css);
        } else {
            $("head").append(css);
        }
    };

    if(!document.getElementById("blackInkCss")) {
        _injectCss('<link id="blackInkCss" rel="stylesheet" type="text/css" href="' + 
            chrome.extension.getURL('/mainTab/blackInk.css') + '" />');
    }
};

init();

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

sendMessage = function(message) {
    chrome.extension.connect().postMessage(message);
};



 //injectCss("BlackInkColor", '<style id="BlackIncColor" class="BlackInc">* {color:black !important;}</style>');