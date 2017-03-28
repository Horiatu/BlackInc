console.log('blackInkTab.js loaded');

try {
    if(!BlackInkLoaded)
        BlackInkLoaded = false;
}
catch (e) {
    BlackInkLoaded = false;
}

if(!BlackInkLoaded)
{
    BlackInkModule = { 
        manualCss: '', 
        cssId: 'BlackInkColor',
        NightModeClass: null, 

        init: function() {
            chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
                switch (req.type) {
                    case 'css':
                        BlackInkModule.cssId = req.cssId || "BlackInkColor";
                        if(req.cssContent !== '')
                        {
                            BlackInkModule.manualCss = '<style id="'+BlackInkModule.cssId+'">' +
                                req.cssContent +
                                '</style>';
                            BlackInkModule.injectCss(BlackInkModule.cssId, BlackInkModule.manualCss);
                        }
                        else {
                            $('#'+BlackInkModule.cssId).remove();
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
                                if(BlackInkModule.NightModeClass)
                                    $('html').removeClass(BlackInkModule.NightModeClass);
                                break;
                            case true :
                                BlackInkModule.NightModeClass = req.cls+"Filter";
                                $('html').addClass(BlackInkModule.NightModeClass);
                                break;
                        }
                        break;
                    case 'pick' :
                        BlackInkModule.pickElements();
                        break;
                }

            });

            if(!document.getElementById("blackInkCss")) {
                BlackInkModule._injectCss('<link id="blackInkCss" rel="stylesheet" type="text/css" href="' + 
                    chrome.extension.getURL('/mainTab/blackInk.css') + '" />');
            }

            BlackInkModule.addFilters();

            // $(window).unbind('keyup', BlackInkModule.blackInkToggles);
            $(window).bind('keyup', BlackInkModule.blackInkToggles);
        
            BlackInkLoaded = true;
            console.log('blackInkTab initialized');
        },

        blackInkScroll: function(e) {
            $("#PickerLdr")
                .css('top', window.scrollY+'px')
                .css('left', window.scrollX+'px');
        },

        blackInkClick : function(e) {
            var button = e.button;
            var x = e.pageX;
            var y = e.pageY;
            e.stopPropagation();
            e.preventDefault();
            var elemntsAtPoint = BlackInkModule.elementsFromPoint(x, y, 
                '*:not("#PickerOvr"):not("#PickerLdr"):not("html"):not("body")');
            var manualRules = [];
            elemntsAtPoint.forEach(function(element) {
                if(element.id && $(element).css('color')) {
                    manualRules.push('#'+element.id+' { color: '+$(element).css('color')+'; }');
                }


                var classList = element.className.split(/\s+/);
                console.log(element, classList);
            });

            BlackInkModule.manualCss = manualRules.join('\n');
            console.log(BlackInkModule.manualCss);
        },

        blackInkKeyPress: function(e) {
            switch (e.keyCode) {
                case 13:
                case 27:
                    $(window).unbind('keyup', BlackInkModule.blackInkKeyPress);
                    $(window).unbind('scroll', BlackInkModule.blackInkScroll);
                    $(window).unbind('mousedown', BlackInkModule.blackInkClick);
                    BlackInkModule.defer.resolve();
                    break;
            }
        },
            
        blackInkToggles: function(e) {
            // console.log(e);
            if(e.ctrlKey && e.shiftKey) {
                switch (e.key) {
                    case 'N':
                    case 'n':
                    case 'F1' :
                        $('html').toggleClass(BlackInkModule.NightModeClass);
                        // e.stopPropagation();
                        // e.preventDefault();
                        break;
                    case 'I':
                    case 'i':
                    case 'F2' :
                        if(BlackInkModule.cssId !== '' && BlackInkModule.manualCss !== '')
                        {
                            if($('#'+BlackInkModule.cssId).length === 0)
                                BlackInkModule.injectCss(BlackInkModule.cssId, BlackInkModule.manualCss);
                            else 
                                $('#'+BlackInkModule.cssId).remove();
                        }
                        // e.stopPropagation();
                        // e.preventDefault();
                        break;
                    case 'P':
                    case 'p':
                    case 'F3' :
                        BlackInkModule.pickElements();
                        e.stopPropagation();
                        e.preventDefault();
                        break;
                }
            }
        },

        injectCss: function(id, css) {
            var element = document.getElementById(id);
            if(element) {
                element.parentNode.removeChild(element);
            }
            if ($("head").length === 0) {
                $("body").before(css);
            } else {
                $("head").append(css);
            }
        },

        _injectCss: function(css) {
            if ($("head").length === 0) {
                $("body").before(css);
            } else {
                $("head").append(css);
            }
        },

        elementsFromPoint: function (x, y, selector) {
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
        },

        blackIncKeyExit: function() {
            if(BlackInkModule.defer && BlackInkModule.defer.state() === "pending") 
                return BlackInkModule.defer.promise();

            BlackInkModule.defer = $.Deferred();

            BlackInkModule.blackInkScroll(null);

            $(window).bind('keyup', BlackInkModule.blackInkKeyPress);
            $(window).bind('scroll', BlackInkModule.blackInkScroll);
            $(window).bind('mousedown', BlackInkModule.blackInkClick);

            return BlackInkModule.defer.promise();
        },

        addFilters: function() {
            if(!document.getElementById("svgFilters")) {
                var s = 
                    "<svg id='svgFilters' xmlns='http://www.w3.org/2000/svg' style='display:none'>\n"+
                    "    <filter id='invertMatrix'>\n"+
                    "        <feColorMatrix type='matrix' values='-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1 0 0 0 1 0'/>\n"+
                    "    </filter>\n"+
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
        },

        pickElements: function() {
            if(!document.getElementById("PickerOvr")) {
                $("body").append('<div id="PickerLdr" style="display:block;""></div>');
                $("#PickerLdr").append('<div id="PickerOvr" style="cursor: url(' + 
                    chrome.extension.getURL("images/cursors/pickColor.cur") + '), crosshair !important; '+
                    '"></div>');
                $('#PickerOvr').append('<div id="PickerOvrHelp" class="Left"><h1>Pick elements</h1>(work in progress.)</div>');
                $('#PickerOvrHelp').mouseenter(function() {
                    $(this).toggleClass("Left Right", 250);
                });
            }
            else {
                $("#PickerLdr").css('display','block');
            }

            BlackInkModule.blackIncKeyExit().then(function() {
                $("#PickerLdr").css('display','none');
                return {message: 'Helo!'};
            });
        },

    };

    BlackInkModule.init();
}




// sendMessage = function(message) {
//     chrome.extension.connect().postMessage(message);
// };
