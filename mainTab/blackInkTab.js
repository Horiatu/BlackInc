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
                        $('body').removeClass("invertFilter");
                        break;
                    case true :
                        $('body').addClass("invertFilter");
                        break;
                }
                break;
            case 'nightMode':
                switch(req.mode) {
                    case false :
                        if($.NightModeClass)
                            $('html').removeClass($.NightModeClass);
                        break;
                    case true :
                        $.NightModeClass = req.cls+"Filter";
                        $('html').addClass($.NightModeClass);
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

    var addFilters = function() {
        if(!document.getElementById("svgFilters")) {
            var s = 
                "<svg id='svgFilters' xmlns='http://www.w3.org/2000/svg' style='display:none'>\n"+
                "    <filter id='invertMatrix'>\n"+
                "        <feColorMatrix type='matrix' values='-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1 0 0 0 1 0'/>\n"+
                "    </filter>\n"+
                // "    <filter id='normalMatrix'>\n"+
                // "        <feColorMatrix type='matrix' values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0'/>\n"+
                // "    </filter>\n"+
                // "    <filter id='sepiaMatrix'>\n"+
                // "        <feColorMatrix type='matrix' values='0.393 0.769 0.189 0 0 0.349 0.686 0.168 0 0 0.272 0.534 0.131 0 0 0   0   0   1 0'/>\n"+
                // "    </filter>\n"+
                "    <filter id='pinkMatrix'>\n"+
                "        <feColorMatrix type='matrix' values='"+
                "1     0.769 0.189 0 0 "+
                "0     0.99  0     0 0 "+
                "0     0     0.99  0 0 "+
                "0     0     0     1 0 '/>\n"+
                "    </filter>\n"+
                "</svg>";

            $("body").append(s);
        }
    };

    addFilters();
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
