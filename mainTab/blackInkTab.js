console.log('blackInkTab.js loaded');

init = function() {
	// var optionsDfr = $.Deferred();
    chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
    	// debugger;
        switch (req.type) {
        	case 'css':
	        	var cssId = req.cssId || "BlackInkColor";
	        		injectCss(req.cssId, req.cssContent);
	        		break;
            // case 'defaults':
            //     options = req;
            //     optionsDfr.resolve(req);
            //     break;
            case 'msg':
                console.log(req.msg);
                //alert(req.msg);
                break;
        }
    });

    //_private.getAllOptionsAsync(optionsDfr).done(function() {
	    if(!document.getElementById("PickerOvr")) {
	        //$("body").wrapInner("<div id='bodyNew'></div>");
	        $("body").append('<div id="PickerLdr"></div>');
	        $("#PickerLdr").append('<div id="PickerOvr" style="display:none; cursor: url(' + 
	        	chrome.extension.getURL("images/cursors/pickColor.cur") + '), crosshair !important; '+
	        	'width: 100%; height: 100%; position: absolute; top: 0; left: 0;"></div>');
	        // addFilters('#PickerLdr');
	    }

	//});

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