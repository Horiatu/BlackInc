// alert();
try {
    if (!BlackInkLoaded)
        BlackInkLoaded = false;
} catch (e) {
    BlackInkLoaded = false;
}


if (!BlackInkLoaded) {
    // alert("!BlackInkLoaded");
    BlackInkModule = {
        manualCss: '',
        cssId: 'BlackInkColor',
        rightClickEvn: null,
        elementsFromPoint: [],
        inSelectElementsMode: false,
        defaults: {
            inkColor: null,
            textWeight: null,
            linkStyle: 1,
            auto: false,
            keyCtrl: true,
            keyShift: true,
            keyAlt: false,
            QTopics: true,
            QStories: true,
            QPromo: true,
        },

        init: function() {
            chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
                switch (req.type) {
                    case 'setDefaults':
                        // console.log('BlackInkModule', BlackInkModule);
                        BlackInkModule.defaults.inkColor = req.inkColor;
                        BlackInkModule.defaults.textWeight = req.textWeight;
                        BlackInkModule.defaults.linkStyle = req.linkStyle;
                        BlackInkModule.defaults.keyCtrl = req.keyCtrl;
                        BlackInkModule.defaults.keyShift = req.keyShift;
                        BlackInkModule.defaults.keyAlt = req.keyAlt;
                        BlackInkModule.defaults.QTopics = req.QTopics;
                        BlackInkModule.defaults.QStories = req.QStories;
                        BlackInkModule.defaults.QPromo = req.QPromo;
                        BlackInkModule.rotateUnderline(BlackInkModule.defaults.linkStyle);
                        // console.log('setDefaults: ', req, BlackInkModule.defaults);
                        break;
                    case 'getDefaults':
                        sendResponse({
                            defaults: BlackInkModule.defaults || {},
                            hasManualCss: $('#' + BlackInkModule.cssId).length > 0,
                        });
                        break;
                    case 'getRightClick':
                        if (BlackInkModule.inSelectElementsMode) break;
                        var f = function(total) {
                            // console.log('getRightClick', total);
                            if (total === 0) return;

                            var index = 0;
                            $(BlackInkModule.elementsFromPoint[index]).addClass('AccessAuditMarker');
                            $('.blackInkHelp:not(".blackIncFiters")').css('display', 'inherit').focus();

                            var arrowKeys = function(e) {
                                // console.log('arrowKeys', e);
                                switch (e.key) {
                                    case 'ArrowDown':
                                        $(BlackInkModule.elementsFromPoint[index]).removeClass('AccessAuditMarker');
                                        index = (index + total - 1) % total;
                                        $(BlackInkModule.elementsFromPoint[index]).addClass('AccessAuditMarker');
                                        e.stopPropagation();
                                        e.preventDefault();
                                        break;
                                    case 'ArrowUp':
                                        $(BlackInkModule.elementsFromPoint[index]).removeClass('AccessAuditMarker');
                                        index = (index + 1) % total;
                                        $(BlackInkModule.elementsFromPoint[index]).addClass('AccessAuditMarker');
                                        e.stopPropagation();
                                        e.preventDefault();
                                        break;
                                    case 'Enter':
                                    case ' ':
                                        $(BlackInkModule.elementsFromPoint[index]).removeClass('AccessAuditMarker');
                                        $(BlackInkModule.elementsFromPoint[index]).addClass('blackInkHide');
                                        BlackInkModule.inSelectElementsMode = false;
                                        $('.blackInkHelp:not(".blackIncFiters")').css('display', 'none');
                                        $(window).unbind('keydown', arrowKeys);
                                        e.stopPropagation();
                                        e.preventDefault();
                                        break;
                                    case 'Escape':
                                        $(BlackInkModule.elementsFromPoint[index]).removeClass('AccessAuditMarker');
                                        BlackInkModule.inSelectElementsMode = false;
                                        $('.blackInkHelp:not(".blackIncFiters")').css('display', 'none');
                                        $(window).unbind('keydown', arrowKeys);
                                        e.stopPropagation();
                                        e.preventDefault();
                                        break;
                                    case 'Delete':
                                        $(BlackInkModule.elementsFromPoint[index]).removeClass('AccessAuditMarker');
                                        $('.blackInkHide').removeClass('blackInkHide');
                                        BlackInkModule.inSelectElementsMode = false;
                                        $('.blackInkHelp:not(".blackIncFiters")').css('display', 'none');
                                        $(window).unbind('keydown', arrowKeys);
                                        e.stopPropagation();
                                        e.preventDefault();
                                        break;
                                    case 'r':
                                    case 'R':
                                        var element = $(BlackInkModule.elementsFromPoint[index])[0];
                                        if (element.tagName == "TEXTAREA") {
                                            element.style.resize = "both";
                                            element.style["max-height"] = "none";
                                            element.style["max-width"] = "none";
                                        } else {
                                            alert("TEXTAREA element not found.");
                                        }
                                        $(BlackInkModule.elementsFromPoint[index]).removeClass('AccessAuditMarker');
                                        BlackInkModule.inSelectElementsMode = false;
                                        $('.blackInkHelp:not(".blackIncFiters")').css('display', 'none');
                                        $(window).unbind('keydown', arrowKeys);
                                        e.stopPropagation();
                                        e.preventDefault();
                                        break;
                                    case 'f':
                                    case 'F':
                                        $(BlackInkModule.elementsFromPoint[index]).removeClass('AccessAuditMarker');
                                        BlackInkModule.inSelectElementsMode = false;
                                        $('.blackInkHelp:not(".blackIncFiters")').css('display', 'none');
                                        $('.blackIncFiters').css('display', 'inherit');
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
                        if (req.cssContent !== '') {
                            BlackInkModule.defaults.inkColor = req.inkColor;
                            BlackInkModule.defaults.textWeight = req.textWeight;

                            BlackInkModule.manualCss = '<style id="' + BlackInkModule.cssId + '">' +
                                // getFilters() +
                                (req.QTopics ? '.SuggestedTopicsBundle * {color: gray !important;}' : '') +
                                (req.QStories ? '.HyperLinkFeedStory * {color: gray !important;}' : '') +
                                (req.QPromo ? '.Bundle.AdBundle * {color: gray !important;}' : '') +
                                req.cssContent +
                                '</style>';
                            BlackInkModule.injectCss(BlackInkModule.cssId, BlackInkModule.manualCss);
                        } else {
                            BlackInkModule._removeCss(BlackInkModule.cssId);
                            BlackInkModule._removeCss(BlackInkModule.cssId + '_Links');
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

            if (!document.getElementById("blackInkCss")) {
                BlackInkModule._injectCss('<link id="blackInkCss" rel="stylesheet" type="text/css" href="' +
                    chrome.extension.getURL('/mainTab/blackInk.css') + '" />');
            }

            BlackInkModule.addFiltersAndHelp();

            $(window).bind('keyup', BlackInkModule.blackInkToggles);

            // https://stackoverflow.com/questions/7703697/how-to-retrieve-the-element-where-a-contextmenu-has-been-executed
            $(window).bind('mousedown', function(event) {
                if (!BlackInkModule.inSelectElementsMode) {
                    //right click
                    if (event.button == 2) {
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
            if (BlackInkModule.cssId !== '' && BlackInkModule.manualCss !== '') {
                if ($('#' + BlackInkModule.cssId).length === 0)
                    BlackInkModule.injectCss(BlackInkModule.cssId, BlackInkModule.manualCss);
                else
                    $('#' + BlackInkModule.cssId).remove();
            }
        },

        toggleBlackInkNightMode: function() {
            $('html').toggleClass('blackFilter');
        },

        linkStyleMode: 0,

        rotateUnderline: function(linkStyle) {
            if (linkStyle) {
                this.linkStyleMode = Number(linkStyle);
            } else {
                this.linkStyleMode = ++this.linkStyleMode % 4;
            }
            // alert('linkStyleMode '+this.linkStyleMode);
            var underlineCss = '<style id="' + BlackInkModule.cssId + '_Links">' +
                'a, a *, article a, article a ~ * { ';
            switch (this.linkStyleMode) {
                case 0:
                    break;
                case 1:
                    underlineCss += 'text-decoration: underline !important; ';
                    break;
                case 2:
                    underlineCss += 'text-decoration: none !important; ';
                    underlineCss += 'background-color: #cfcfcf !important; ';
                    underlineCss += 'padding-left: 4px !important; ';
                    underlineCss += 'padding-right: 4px !important; ';
                    break;
                case 3:
                    underlineCss += 'text-decoration: none !important; ';
                    if (!BlackInkModule.defaults.inkColor || BlackInkModule.defaults.inkColor === 'none')
                        underlineCss += 'background-color: ' + BlackInkModule.defaults.inkColor + ' !important; ';
                    underlineCss += 'color: white !important; ';
                    underlineCss += 'padding-left: 4px !important; ';
                    underlineCss += 'padding-right: 4px !important; ';
                    break;
            }
            underlineCss += '}</style>';
            BlackInkModule.injectCss(BlackInkModule.cssId + '_Links', underlineCss);
        },

        isActivationKey: function(e) {
            // console.log('isActivationKey', BlackInkModule.defaults, e);
            return !(!BlackInkModule.defaults.keyCtrl ^ !e.ctrlKey) &&
                !(!BlackInkModule.defaults.keyShift ^ !e.shiftKey) &&
                !(!BlackInkModule.defaults.keyAlt ^ !e.altKey);
        },

        blackInkToggles: function(e) {
            // console.log(e);

            switch (e.key) {
                case 'F1':
                    if (BlackInkModule.isActivationKey(e)) {
                        BlackInkModule.toggleBlackInk();
                        e.stopPropagation();
                        e.preventDefault();
                    }
                    break;
                case 'F2':
                    if (BlackInkModule.isActivationKey(e)) {
                        BlackInkModule.toggleBlackInkNightMode();
                        e.stopPropagation();
                        e.preventDefault();
                    }
                    break;
                case 'F3':
                    if (BlackInkModule.isActivationKey(e)) {
                        BlackInkModule.rotateUnderline();
                        e.stopPropagation();
                        e.preventDefault();
                    }
                    break;
                case 'ArrowUp':
                case 'ArrowDown':
                case 'Enter':
                case ' ':
                case 'Escape':
                case 'Delete':
                    if (BlackInkModule.inSelectElementsMode) {
                        e.stopPropagation();
                        e.preventDefault();
                    }
                    break;

            }
        },

        injectCss: function(id, css) {
            this._removeCss(id);
            this._injectCss(css);
        },

        _removeCss: function(id) {
            var element = document.getElementById(id);
            if (element) {
                element.parentNode.removeChild(element);
            }
        },

        _injectCss: function(css) {
            if ($("head").length === 0) {
                $("body").before(css);
            } else {
                $("head").append(css);
            }
        },

        filters: [
            { name: "brightness", min: 0, max: 3, value: 1, step: 0.1, units: "" },
            { name: "contrast", min: 0, max: 3, value: 1, step: 0.1, units: "" },
            { name: "grayscale", min: 0, max: 1, value: 0, step: 0.01, units: "" },
            { name: "hue-rotate", min: 0, max: 360, value: 0, step: 1, units: "deg" },
            { name: "invert", min: 0, max: 1, value: 0, step: 1, units: "" },
            { name: "saturate", min: 0, max: 3, value: 1, step: 0.01, units: "" },
            { name: "sepia", min: 0, max: 1, value: 0, step: 0.01, units: "" },
        ],

        getFiltersCSS: (reset = false) => {
            return BlackInkModule.filters.reduce((css, filter) => {
                return css + ` ${filter.name}(${filter.newValue && !reset ? filter.newValue : filter.value}${filter.units})`;
            }, "body { filter:") + ";}";
        },

        updateFilters: () => {
            const filtersId = `${BlackInkModule.cssId}_Filters`;
            const filtersCss = `<style id="${filtersId}">${BlackInkModule.getFiltersCSS()}</style>`;
            BlackInkModule.injectCss(filtersId, filtersCss);
        },

        addFiltersAndHelp: function() {
            if (!document.getElementById("svgFilters")) {
                const svgFilters = $("<svg></svg>", {
                    id: "svgFilters",
                    xmlns: "http://www.w3.org/2000/svg",
                    style: "display:none"
                }).appendTo("body");

                const invertMatrix = $("<filter></filter>", {
                    id: "invertMatrix"
                }).appendTo(svgFilters);
                $("<feColorMatrix></feColorMatrix>", {
                    type: "matrix",
                    values: "1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0"
                }).appendTo(invertMatrix);

                const pinkMatrix = $("<filter></filter>", {
                    id: "pinkMatrix"
                }).appendTo(svgFilters);
                $("<feColorMatrix></feColorMatrix>", {
                    type: "matrix",
                    values: `
                           1     0.769 0.189 0 0
                           0     0.99  0     0 0
                           0     0     0.99  0 0
                           0     0     0     1 0`
                }).appendTo(pinkMatrix);

                const blueish = $("<filter></filter>", {
                    id: "blueish"
                }).appendTo(svgFilters);
                $("<feColorMatrix></feColorMatrix>", {
                    type: "matrix",
                    values: `
                           0.272 0.534 0.131 0    0
                           0.272 0.534 0.131 0    0
                           0.393 0.769 0.189 0    0
                           0     0     0     0.95 0`
                }).appendTo(blueish);

                const blackInkHelp = $("<div></div>", {
                    id: "blackInkHelp",
                    "class": "blackInkHelp helpTop",
                    style: "display:none;",
                    tabindex: "0",
                    role: "dialog"
                }).on("mouseenter", function(event) {
                    $(event.target).toggleClass('helpTop').toggleClass('helpBottom').focus();
                }).appendTo("body");

                $("<img></img>", {
                    "class": "blackInkLogo",
                    alt: "logo",
                    src: chrome.extension.getURL("/images/logos/32.png")
                }).appendTo(blackInkHelp);

                $("<h1></h1>").html("BlackInk Help<hide>.</hide>").appendTo(blackInkHelp);
                $("<h2></h2>").html("Hide Elements<hide>.</hide></h2>").appendTo(blackInkHelp);
                $("<p></p>").html(`
Press <MyKey>Escape</MyKey> to cancel this mode<hide>.</hide><br/>
Press <MyKey>Arrow-Up</MyKey> or <MyKey>Arrow-Down</MyKey> to move parent or child element.<br/>
Press <MyKey>Enter</MyKey> or <MyKey>Space Bar</MyKey> to hide the selected element.<br/>
Press <MyKey>Delete</MyKey> to unhide all previously hidden elements.                
                `.trim()).appendTo(blackInkHelp);

                $("<h2></h2>").html("Other Commands<hide>.</hide></h2>").appendTo(blackInkHelp);
                const ocTable = $("<table role='presentation'></table>").appendTo(blackInkHelp);
                const tr1 = $("<tr></tr>").appendTo(ocTable);
                const td1 = $("<td style='text-align: left; vertical-align: top;'></td>").appendTo(tr1);
                $("<p></p>").html(`
<myKey>Ctrl</myKey><myKey>Shift</myKey><myKey>F1</myKey> toggle black ink.<br/>
<myKey>Ctrl</myKey><myKey>Shift</myKey><myKey>F2</myKey> toggle invert colors.
`.trim()).appendTo(td1);
                const td2 = $("<td style='vertical-align: top;'></td>").appendTo(tr1);
                $("<p></p>").html(`
<myKey>R</myKey> resize TextArea<br/>
<myKey>F</myKey> Filters`.trim()).appendTo(td2);

            }

            if (!document.getElementById("opticFilters")) {
                const filtersForm = $("<div></div>", {
                    id: "opticFilters",
                    role: "dialog",
                    "class": "blackInkHelp blackIncFiters",
                    style: "display: none;"
                }).appendTo("body");

                $("<img></img>", {
                    "class": "blackInkLogo",
                    alt: "logo",
                    src: chrome.extension.getURL("/images/logos/32.png")
                }).appendTo(filtersForm);
                $("<h1></h1>").html("BlackInk Optical Filters<hide>.</hide>").appendTo(filtersForm);
                $("<h2></h2>").appendTo(filtersForm);

                const ranges = [];

                BlackInkModule.filters.forEach(filter => {
                    const id = "blackInk_filter__" + filter.name.replace("-", "_");

                    const itemWrapper = $("<div></div>").appendTo(filtersForm);

                    ($("<label></label>", {
                        "for": id,
                        "class": "blackInk_filter__label"
                    }).html($("<div></div>").html(filter.name))).appendTo(itemWrapper);

                    const output = $("<output></output>", {
                        for: id,
                        style: "font-weight:normal !important;"
                    }).val(filter.value);

                    const range = $("<input></input>", {
                        type: "range",
                        "data-filter": filter.name,
                        "data-units": filter.units,
                        min: filter.min,
                        max: filter.max,
                        value: filter.value,
                        step: filter.step,
                        style: "margin-right: 8px;"
                    }).appendTo(itemWrapper).on("input", (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        try {
                            const filter = BlackInkModule.filters.find(f => { return f.name == event.target.dataset.filter; });
                            if (filter) {
                                filter.newValue = event.target.value;
                                $(output).html(filter.newValue);
                                BlackInkModule.updateFilters();
                            }
                        } catch (e) {
                            alert("error " + e.message);
                        }
                    });

                    ranges.push(range);

                    $(output).appendTo(itemWrapper);

                });

                $("<h2></h2>").appendTo(filtersForm);
                $("<input></input>", { type: "button", "class": "blackIncFiters_input", value: "Reset" }).appendTo(filtersForm).on("click", () => {
                    ranges.forEach(range => {
                        const filter = BlackInkModule.filters.find(f => { return f.name == range[0].dataset.filter; });
                        if (filter) {
                            delete filter.newValue;
                            $(range[0]).val(filter.value);
                            const id = "blackInk_filter__" + filter.name.replace("-", "_");
                            $(`output[for="${id}"]`).val(filter.value);
                        }
                    });
                    BlackInkModule.updateFilters();
                });
                $("<input></input>", { type: "button", "class": "blackIncFiters_input", value: "Close", style: "float:right;" }).appendTo(filtersForm).on("click", () => {
                    $(filtersForm).css("display", "none");
                });
                $("<input></input>", { type: "button", "class": "blackIncFiters_input", value: "Save", style: "float:right;" }).appendTo(filtersForm);

            }
        },
    };

    BlackInkModule.init();
}