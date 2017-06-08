try {
    if(!BlackInkLoaded)
        BlackInkLoaded = false;
}
catch (e) {
    BlackInkLoaded = false;
}

if(!BlackInkLoaded)
{
//     alert('!BlackInkLoaded');
// debugger;
    BlackInkModule = { 
        manualCss: '', 
        cssId: 'BlackInkColor',
        defaults: {
            inkColor: null,
            textWeight: null,
            auto: true,
        },

        init: function() {
            chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
                debugger;
                switch (req.type) {
                    case 'setDefaults':
                        BlackInkModule.defaults.inkColor = req.inkColor;
                        BlackInkModule.defaults.textWeight = req.textWeight;
                        console.log('setDefaults: ',BlackInkModule.defaults);
                        break;
                    case 'getDefaults':
                        sendResponse({
                            defaults:BlackInkModule.defaults || {},
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
               }
            });

            if(!document.getElementById("blackInkCss")) {
                BlackInkModule._injectCss('<link id="blackInkCss" rel="stylesheet" type="text/css" href="' + 
                    chrome.extension.getURL('/mainTab/blackInk.css') + '" />');
            }

            // BlackInkModule.addFilters();

            $(window).bind('keyup', BlackInkModule.blackInkToggles);
        
            BlackInkLoaded = true;
        },

        toggleBlackInk: function() {
            debugger;
            if(BlackInkModule.cssId !== '')
            {
                if($('#'+BlackInkModule.cssId).length === 0)
                    BlackInkModule.injectCss(BlackInkModule.cssId, BlackInkModule.manualCss);
                else 
                    $('#'+BlackInkModule.cssId).remove();
            }
        },

        blackInkToggles: function(e) {
            alert('blackInkToggles');
            console.log(e);
            if(e.ctrlKey && e.shiftKey &&e.key==='F1')
            {
                BlackInkModule.toggleBlackInk();
                e.stopPropagation();
                e.preventDefault();
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

    };

    BlackInkModule.init();
}
