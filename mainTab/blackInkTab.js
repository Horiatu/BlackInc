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
        rightClickEvn: null,
        elementsFromPoint: [],
        inSelectElementsMode: false,
        defaults: {
            inkColor: null,
            textWeight: null,
            auto: false,
            },

        init: function() {
            chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
                switch (req.type) {
                    case 'setDefaults':
                        // console.log('BlackInkModule', BlackInkModule);
                        BlackInkModule.defaults.inkColor = req.inkColor;
                        BlackInkModule.defaults.textWeight = req.textWeight;
                        // console.log('setDefaults: ',BlackInkModule.defaults);
                        break;
                    case 'getDefaults':
                        sendResponse({
                            defaults:BlackInkModule.defaults || {},
                            hasManualCss: $('#'+BlackInkModule.cssId).length > 0, 
                        });
                        break;
                    case 'getRightClick':
                        if(BlackInkModule.inSelectElementsMode) break;
                        var f = function(total) {
                            // console.log('getRightClick', total);
                            if(total === 0) return;

                            var index = 0;
                            $(BlackInkModule.elementsFromPoint[index]).addClass('AccessAuditMarker');
                            $('.blackInkHelp').css('display', 'inherit').focus();
                            
                            var arrowKeys = function(e) {
                                // console.log('arrowKeys', e);
                                switch (e.key) {
                                    case 'ArrowDown' :
                                        $(BlackInkModule.elementsFromPoint[index]).removeClass('AccessAuditMarker');
                                        index = (index+total-1) % total;
                                        $(BlackInkModule.elementsFromPoint[index]).addClass('AccessAuditMarker');
                                        e.stopPropagation();
                                        e.preventDefault();
                                        break;
                                    case 'ArrowUp' :
                                        $(BlackInkModule.elementsFromPoint[index]).removeClass('AccessAuditMarker');
                                        index = (index+1) % total;
                                        $(BlackInkModule.elementsFromPoint[index]).addClass('AccessAuditMarker');
                                        e.stopPropagation();
                                        e.preventDefault();
                                        break;
                                    case 'Enter' :
                                    case ' ' :
                                        $(BlackInkModule.elementsFromPoint[index]).removeClass('AccessAuditMarker');
                                        $(BlackInkModule.elementsFromPoint[index]).addClass('blackInkHide');
                                        BlackInkModule.inSelectElementsMode = false;
                                        $('.blackInkHelp').css('display', 'none');
                                        $(window).unbind('keydown', arrowKeys);
                                        e.stopPropagation();
                                        e.preventDefault();
                                        break;
                                    case 'Escape' :
                                        $(BlackInkModule.elementsFromPoint[index]).removeClass('AccessAuditMarker');
                                        BlackInkModule.inSelectElementsMode = false;
                                        $('.blackInkHelp').css('display', 'none');
                                        $(window).unbind('keydown', arrowKeys);
                                        e.stopPropagation();
                                        e.preventDefault();
                                        break;
                                    case 'Delete' :
                                        $(BlackInkModule.elementsFromPoint[index]).removeClass('AccessAuditMarker');
                                        $('.blackInkHide').removeClass('blackInkHide');
                                        BlackInkModule.inSelectElementsMode = false;
                                        $('.blackInkHelp').css('display', 'none');
                                        $(window).unbind('keydown', arrowKeys);
                                        e.stopPropagation();
                                        e.preventDefault();
                                        break;
                                }
                                // }
                            };

                            $(window).bind('keydown', arrowKeys);
                            BlackInkModule.inSelectElementsMode = true;

                        }(BlackInkModule.elementsFromPoint.length);
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
                    // case 'invert':
                    //     switch(req.mode) {
                    //         case false :
                    //             $('body').removeClass("invertFilter");
                    //             break;
                    //         case true :
                    //             $('body').addClass("invertFilter");
                    //             break;
                    //     }
                    //     break;
                }
            });

            if(!document.getElementById("blackInkCss")) {
                BlackInkModule._injectCss('<link id="blackInkCss" rel="stylesheet" type="text/css" href="' + 
                    chrome.extension.getURL('/mainTab/blackInk.css') + '" />');
            }

            BlackInkModule.addFiltersAndHelp();

            $(window).bind('keyup', BlackInkModule.blackInkToggles);
        
            // https://stackoverflow.com/questions/7703697/how-to-retrieve-the-element-where-a-contextmenu-has-been-executed
            $(window).bind('mousedown', function(event){
                if(!BlackInkModule.inSelectElementsMode) {
                    //right click
                    if(event.button == 2) { 
                        BlackInkModule.rightClickEvn = event;
                        // console.log(BlackInkModule.rightClickEvn);

                        var x = event.clientX;
                        var y = event.clientY;

                        BlackInkModule.elementsFromPoint = document.elementsFromPoint(x, y);

                        // sconsole.log('elementsFromPoint', BlackInkModule.elementsFromPoint);
                    }
                }
            });

            BlackInkModule.toggleBlackInk();

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
            $('html').toggleClass('blackFilter');
        },

        blackInkToggles: function(e) {
            // console.log(e);
            
            switch (e.key) {
                case 'F1' :
                    if(e.ctrlKey && e.shiftKey) {
                        BlackInkModule.toggleBlackInk();
                        e.stopPropagation();
                        e.preventDefault();
                    }
                    break;
                case 'F2' :
                    if(e.ctrlKey && e.shiftKey) {
                        BlackInkModule.toggleBlackInkNightMode();
                        e.stopPropagation();
                        e.preventDefault();
                    }
                    break;
                case 'ArrowUp' :
                case 'ArrowDown' :
                case 'Enter' :
                case ' ' :
                case 'Escape' :
                case 'Delete' :
                    if(BlackInkModule.inSelectElementsMode)
                    {
                        e.stopPropagation();
                        e.preventDefault();
                    }
                    break;                
            }
        },

        injectCss: function(id, css) {
            var element = document.getElementById(id);
            if(element) {
                element.parentNode.removeChild(element);
            }
            this._injectCss(css);
            // if ($("head").length === 0) {
            //     $("body").before(css);
            // } else {
            //     $("head").append(css);
            // }
        },

        _injectCss: function(css) {
            if ($("head").length === 0) {
                $("body").before(css);
            } else {
                $("head").append(css);
            }
        },

        addFiltersAndHelp: function() {
            if(!document.getElementById("svgFilters")) {
                var s = 
                    "<svg id='svgFilters' xmlns='http://www.w3.org/2000/svg' style='display:none'>\n"+
                    "    <filter id='invertMatrix'>\n"+
                    "        <feColorMatrix type='matrix' values='-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1 0 0 0 1 0'/>\n"+
                    "    </filter>\n"+
                    "    <filter id='pinkMatrix'>\n"+
                    "        <feColorMatrix type='matrix' values='"+
                    "       1     0.769 0.189 0 0 "+
                    "       0     0.99  0     0 0 "+
                    "       0     0     0.99  0 0 "+
                    "       0     0     0     1 0 '/>\n"+
                    "    </filter>\n"+
                    "    <filter id='blueish'>\n"+
                    "        <feColorMatrix type='matrix' values='"+
                    "       0.272 0.534 0.131 0    0 "+
                    "       0.272 0.534 0.131 0    0 "+
                    "       0.393 0.769 0.189 0    0 "+
                    "       0     0     0     0.95 0'/>\n"+
                    "    </filter>\n"+
                    "</svg>\n"+

                    "<div"+
                    " class='blackInkHelp helpTop'"+
                    " id='blackInkHelp'"+
                    " style='display:none;'"+
                    " tabindex='0'"+
                    " role='dialog'"+
                    ">"+

                    "<img id='blackInkLogo' alt=''><h1>BlackInk Help<hide>.</hide></h1>"+
                    
                    "<h2>Hide Elements<hide>.</hide></h2>"+
                    "<p>Press <MyKey>Escape</MyKey> to cancel this mode<hide>.</hide><br/>"+
                    "Press <MyKey>Arrow-Up</MyKey> or <MyKey>Arrow-Down</MyKey> to move parent or child element.<br/>"+
                    "Press <MyKey>Enter</MyKey> or <MyKey>Space Bar</MyKey> to hide the selected element.<br/>"+
                    "Press <MyKey>Delete</MyKey> to unhide all previously hidden elements.</p>"+
                    
                    "<h2>Other Commands<hide>.</hide></h2>"+
                    "<p><myKey>Ctrl</myKey><myKey>Shift</myKey><myKey>F1</myKey> toggle black ink.<br/>"+
                    "<myKey>Ctrl</myKey><myKey>Shift</myKey><myKey>F2</myKey> toggle invert colors.<br/>"+
                    "</p>"+

                    "</div>";
                    s = s.replace(/[\s+|\n+]+/g, ' ').replace(/\>\s+\</g, '><');
                // alert(s);

                $("body").append(s);

                 $('#blackInkLogo').attr('src', chrome.extension.getURL("/images/logos/32.png"));

                document.getElementById("blackInkHelp").addEventListener("mouseenter", function( event ) {
                    $(event.target).toggleClass('helpTop').toggleClass('helpBottom').focus();
                });
            }
        },

    };

    BlackInkModule.init();
}