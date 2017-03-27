console.log('blackInkTab.js loaded');

init = function() {
    chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
        switch (req.type) {
        	case 'css':
	        	var cssId = req.cssId || "BlackInkColor";
                if(req.cssContent != '')
        		    injectCss(req.cssId, 
                        '<style id="BlackIncColor" class="BlackInc">' +
                        req.cssContent +
                        '</style>');
                else {
                    $('#'+cssId).remove();
                }
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
            case 'pick' :
                sendResponse($PickElements());
                break;
        }
    });

    $PickElements = function() {
        if(!document.getElementById("PickerOvr")) {
            $("body").append('<div id="PickerLdr" style="display:block;""></div>');
            $("#PickerLdr").append('<div id="PickerOvr" style="cursor: url(' + 
            	chrome.extension.getURL("images/cursors/pickColor.cur") + '), crosshair !important; '+
            	'"></div>');
        }
        else {
            $("#PickerLdr").css('display','block');
        }

        $BlackIncKeyExit().then(function() {
            $("#PickerLdr").css('display','none');
            return {message: 'Helo!'};
        });
    };

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

$BlackIncKeyExit = function() {
    var defer = $.Deferred();
    var blackInkKeyPress = function(e) {
        switch (e.keyCode) {
            case 13:
            case 27:
                $(window).unbind('keyup', blackInkKeyPress);
                $(window).unbind('scroll', blackInkScroll);
                $(window).unbind('mousedown', blackInkClick);
                defer.resolve();
                break;
        }
    };

    var blackInkScroll = function(e) {
        $("#PickerLdr")
            .css('top', window.scrollY+'px')
            .css('left', window.scrollX+'px');
    };

    blackInkScroll(null);

    var elementsFromPoint = function (x, y, selector) {
        var elements = [], previousPointerEvents = [], current, i, d;

        // get all elements via elementFromPoint, and remove them from hit-testing in order
        while ((current = document.elementFromPoint(x,y)) && elements.indexOf(current)===-1 && current !== null) {
            
            // push the element and its current style
            elements.push(current);
            
            previousPointerEvents.push({
                element: current,
                value: current.style.getPropertyValue('pointer-events'),
                priority: current.style.getPropertyPriority('pointer-events')
            });
              
            // add "pointer-events: none", to get to the underlying element
            current.style.setProperty('pointer-events', 'none', 'important');
        }

        // restore the previous pointer-events values
        for(var ii = previousPointerEvents.length; --ii>=0; ) {
            var dd = previousPointerEvents[ii]; 
            if(dd && dd.element)
            {
                if(dd.value && dd.value !== "") 
                {
                    dd.element.style.setProperty('pointer-events', dd.value?dd.value:'', dd.priority); 
                } 
                else 
                {
                    dd.element.style.removeProperty ('pointer-events');
                }
            }
        }
          
        if(selector && selector !== undefined && selector !=='') {
            elements = $(elements).filter(selector).toArray();
        }
        return elements;
    };

    $.manualCss = [];

    var blackInkClick = function(e) {
        var button = e.button;
        var x = e.pageX;
        var y = e.pageY;
        e.stopPropagation();
        e.preventDefault();
        var elemntsAtPoint = elementsFromPoint(x, y, 
            '*:not("#PickerOvr"):not("#PickerLdr"):not("html")');
        elemntsAtPoint.forEach(function(element) {
            if(element.id && $(element).css('color')) {
                $.manualCss.push('#'+element.id+' { color: '+$(element).css('color')+'; }');
            }


            var classList = element.className.split(/\s+/);
            console.log(element, classList);
        });

        console.log($.manualCss.join('\n'));
    };

    $(window).bind('keyup', blackInkKeyPress);
    $(window).bind('scroll', blackInkScroll);
    $(window).bind('mousedown', blackInkClick);

    return defer.promise();
};

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
