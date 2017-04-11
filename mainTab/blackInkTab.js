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
        defaults: {
            inkColor: null,
            textWeight: null,
            auto: false,
            sunRise: null,
            sunSet: null,
        },

        init: function() {
            chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
                switch (req.type) {
                    case 'setDefaults':
                        BlackInkModule.defaults.inkColor = req.inkColor;
                        BlackInkModule.defaults.textWeight = req.textWeight;
                        console.log('setDefaults: ',BlackInkModule.defaults);
                        break;
                    case 'getDefaults':
                        sendResponse({
                            defaults:BlackInkModule.defaults || {},
                            hasNightMode: BlackInkModule.NightModeClass !== null && $('html').hasClass(BlackInkModule.NightModeClass), 
                            hasManualCss: $('#'+BlackInkModule.cssId).length > 0, 
                        });
                        break;
                    case 'css':
                        BlackInkModule.cssId = req.cssId || "BlackInkColor";
                        if(req.cssContent !== '')
                        {
                            BlackInkModule.defaults.inkColor = req.inkColor;
                            BlackInkModule.defaults.textWeight = req.textWeight;

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

            $(window).bind('keyup', BlackInkModule.blackInkToggles);
        
            BlackInkLoaded = true;
        },

        toggleBlackInk: function() {
            if(BlackInkModule.cssId !== '' && BlackInkModule.manualCss !== '')
            {
                if($('#'+BlackInkModule.cssId).length === 0)
                    BlackInkModule.injectCss(BlackInkModule.cssId, BlackInkModule.manualCss);
                else 
                    $('#'+BlackInkModule.cssId).remove();
            }
        },

        toggleBlackInkNightMode: function() {
            $('html').toggleClass(BlackInkModule.NightModeClass);
        },

        blackInkToggles: function(e) {
            // console.log(e);
            if(e.ctrlKey && e.shiftKey) {
                switch (e.key) {
                    case 'F1' :
                        BlackInkModule.toggleBlackInk();
                        e.stopPropagation();
                        e.preventDefault();
                        break;
                    case 'F2' :
                        BlackInkModule.toggleBlackInkNightMode();
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

    };

    BlackInkModule.init();
}
