angular.module('blackInkApp').controller('BlackInkCtrl', function($scope, $q, $http, blackInkStorage, tabService) {

    $scope.blackInkStorage = blackInkStorage;
    $scope.tabService = tabService;
    $scope.errorMessage = '';
    $scope.tabId = 0;
    $scope.initTabs = [];

    var defaults = {
        InkColor: 'black',
        TextWeight: 'bold',
        linkStyle: '1',
        ShowHelp: 'inherit',

        keyCtrl: true,
        keyShift: true,
        keyAlt: false,

        helpTooltip: 'hide help',
    };

    //$scope.blackInkStorage.removeAll();

    chrome.tabs.onSelectionChanged.addListener(function(tabId) {
        $scope.tabId = tabId;
        // console.log('onSelectionChanged: ', tabId);
    });

    chrome.tabs.onUpdated.addListener(function(tabId) {
        // console.log('initTabs: ', $scope.initTabs);
        $scope.initTabs.filterRemove(function(item) {
            return item.tabId === tabId;
        });
        // console.log('onUpdated: ', tabId, $scope.initTabs);
    });

    chrome.tabs.onRemoved.addListener(function(tabId) {
        // console.log('initTabs: ', $scope.initTabs);
        $scope.initTabs.filterRemove(function(item) {
            return item.tabId === tabId;
        });
        // console.log('onRemoved: ', tabId, $scope.initTabs);
    });

    chrome.browserAction.onClicked.addListener(function(tab) { 
        // alert('icon clicked: ', tab);
        var tabExists = $scope.initTabs.some(function(item) {
            return item.tabId === tab.id;
        });

        if(!tabExists) {
            // $scope.initTabs.push({tabId: tab.id});

            $scope.init().then(
                function(r){
                    $scope.initTabs.push({
                        tabId: tab.id, 
                        // tab: tab
                    });
                    // console.log('initTabs: ', $scope.initTabs);

                    $scope.toggle();
                },
                function(err) {
                    // $scope.badge('X', 'red');
                    chrome.browserAction.disable(tab.id);
                    // alert(err);
                }
            );
        } else {
            $scope.toggle();
        }
    });

    $scope.toggle = function() {
        // alert('toggle');
        $scope.tabService.sendMessage($scope.tabId, {type:'getDefaults'},
        function(msg) {
            // console.log('getDefaults: ',msg);

            if(msg) {
                var applyCss = msg.hasManualCss;
                $scope.apply(applyCss);
            }
            else {
                // alert('toggle '+$scope.keyCtrl+' '+$scope.keyShift+' '+$scope.keyAlt);
                $scope.tabService.sendMessage($scope.tabId, {
                    type:'setDefaults',
                    inkColor: $scope.InkColor,
                    textWeight: $scope.TextWeight,
                    linkStyle: $scope.linkStyle,
                    keyCtrl: $scope.keyCtrl,
                    keyShift: $scope.keyShift,
                    keyAlt: $scope.keyAlt,
                }, function() {
                    $scope.apply(false);
                });
            }
        });
    };

    $scope.init = function() {
        // alert('init');
        var defer = $q.defer();

        chrome.contextMenus.removeAll(function() {
            chrome.contextMenus.create({
                id: 'BlackIncMenuItem',
                title: 'BlackInc Little',
                contexts: [chrome.contextMenus.ContextType.ALL],
                onclick: function(info, tab) {
                    // console.log('click info:', info, tab);
                    $scope.tabService.sendMessage($scope.tabId, {type:'getRightClick'});
                },
            });
        });

        tabService.initTab([
            {
                allFrames: false,
                file: true,
                content: "/lib/jquery/jquery-2.1.4.min.js"
            }, 
            // {
            //     allFrames: false,
            //     file: true,
            //     content: "/lib/jquery/jquery-ui.min.js"
            // }, 
            {
                allFrames: false,
                file: true,
                content: "/mainTab/blackInkTab.js"
           }
        ]).then(
            function(tabId) {
                $scope.tabId = tabId;
                // alert("tabId: "+ tabId);
                $scope.blackInkStorage.findAll(defaults).then(
                    function blackInkStorageSuccess(data) {
                        $scope.blackInkStorage.Data = data;
                        data.forEachProp(function(k, v) {
                            $scope[k] = v;
                        });

                        // console.log('blackInkStorage.findAll', data, $scope);
                        var getDefaultsDefer = $q.defer();
                        
                        $scope.tabService.sendMessage($scope.tabId, {type:'getDefaults'},
                            function(msg) {
                                // console.log('getDefaults: ',msg);

                                if(msg) {
                                    getDefaultsDefer.resolve({
                                        applyCss: msg.hasManualCss
                                    });
                                }
                                else {
                                    // alert('initTab '+$scope.keyCtrl+' '+$scope.keyShift+' '+$scope.keyAlt);
                                    $scope.tabService.sendMessage($scope.tabId, {
                                        type:'setDefaults',
                                        inkColor: $scope.InkColor,
                                        textWeight: $scope.TextWeight,
                                        linkStyle: $scope.linkStyle,
                                        keyCtrl: $scope.keyCtrl,
                                        keyShift: $scope.keyShift,
                                        keyAlt: $scope.keyAlt,
                                    }, function(){
                                        getDefaultsDefer.resolve({
                                            applyCss: false
                                        });
                                    });
                                }
                            }
                        );

                        getDefaultsDefer.promise.then(function(msgData) {
                            $scope.applyCss = msgData.applyCss;
                            defer.resolve();
                        });
                    },
                    function blackInkStorageError(err) {
                        defer.reject(err);
                    }
                );
            },
            function initTabError(err){
                defer.reject(err);
            }
        );
        return defer.promise;
    };

    $scope.removeAll = function() {
        blackInkStorage.removeAll();
    };

    $scope.apply = function(applyCss) {
        $scope.tabService.sendMessage($scope.tabId, {
            type: "css",
            cssId: 'BlackInkColor',
            inkColor: $scope.InkColor,
            textWeight: $scope.TextWeight,
            linkStyle: $scope.linkStyle,
            keyCtrl: $scope.keyCtrl,
            keyShift: $scope.keyShift,
            keyAlt: $scope.keyAlt,
            cssContent:
                !applyCss ? 
                    '* {'+
                        'color:'+$scope.InkColor+' !important; '+
                        (($scope.TextWeight !== '') ? 'font-weight:'+$scope.TextWeight+' !important; ' : '') +
                    '} ' // +
                    // 'a, article a, article a ~ * {' +
                    // '    text-decoration: underline !important;'+
                    // '} '+
                    // 'p {'+
                    // '    font-size: 120% !important;'+
                    // '} '
                    : ''
        });
        $scope.badge('On', applyCss ? 'gray' : $scope.InkColor);
    };

    $scope.badge = function(text, color) {
        // alert('Badge: '+text);
        chrome.browserAction.setBadgeBackgroundColor({
            color: color,
            tabId: $scope.tabId
        });
        chrome.browserAction.setBadgeText({
            text: text,
            tabId: $scope.tabId
        });
    };

    // alert('loaded');
});
