angular.module('blackInkApp').controller('BlackInkCtrl', function($scope, $q, $http, blackInkStorage, tabService) {

	$scope.blackInkStorage = blackInkStorage;
    $scope.tabService = tabService;
    $scope.errorMessage = '';
    $scope.tabId = 0;
    $scope.initTabs = [];

    var defaults = {
        InkColor: 'black',
        TextWeight: 'bold',
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
        // alert('icon clicked: '+tab.id);
        var tabExists = $scope.initTabs.some(function(item) {
            return item.tabId === tab.id;
        });

        if(!tabExists) {
            // $scope.initTabs.push({tabId: tab.id});

            $scope.init().then(
                function(r){
                    $scope.initTabs.push({tabId: tab.id});
                    // console.log('initTabs: ', $scope.initTabs);                

                    $scope.toggle();
                },
                function(err) {
                    $scope.badge('X', [0, 153, 51, 1]);
                    alert(err);
                }
            );
        } else {
            $scope.toggle();
        }
    });

    $scope.toggle = function() {
        $scope.tabService.sendMessage($scope.tabId, {type:'getDefaults'},
        function(msg) {
            // console.log('getDefaults: ',msg);

            if(msg) {
                var applyCss = msg.hasManualCss;
                $scope.apply(applyCss);
            }
            else {
                console.log('setDefaults');
                $scope.tabService.sendMessage($scope.tabId, {
                    type:'setDefaults',
                    inkColor: $scope.InkColor,
                    textWeight: $scope.TextWeight,
                });
            }
        });
    };

    $scope.init = function() {
        var defer = $q.defer();
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
                        console.log('blackInkStorage.findAll:', data);
                        $scope.blackInkStorage.Data = data;
                        data.forEachProp(function(k, v) {
                            //console.log('--'+k+':',v ? v.toString() : v);
                            $scope[k] = v;
                        });

                        var getDefaultsDefer = $q.defer();
                        
                        completted.promise.then(
                            function completedSuccess() {
                                console.log('completed');

                                $scope.tabService.sendMessage($scope.tabId, {type:'getDefaults'},
                                    function(msg) {
                                        // console.log('getDefaults: ',msg);

                                        if(msg) {
                                            getDefaultsDefer.resolve({
                                                applyCss: msg.hasManualCss
                                            });
                                        }
                                        else {
                                            console.log('setDefaults');
                                            $scope.tabService.sendMessage($scope.tabId, {
                                                type:'setDefaults',
                                                inkColor: $scope.InkColor,
                                                textWeight: $scope.TextWeight,
                                            });
                                        }
                                    }
                                );
                            },
                            function completedError(msg) {
                                console.log('completed Error:',msg);
                                alert('completed Error: '+ msg);
                            }
                        );

                        getDefaultsDefer.promise.then(function(msgData) {

                            chrome.tabs.onSelectionChanged.addListener(function(tabId) {
                                $scope.tabId = tabId;
                            });

                            $scope.applyCss = msgData.applyCss;
                            defer.resolve();
                        });
                    },
                    function blackInkStorageError(err) {
                        console.log('blackInkStorage.error:', err);
                        console.error('blackInkStorage:', err);
                        $scope.errorMessage = err;
                        $scope.badge('X', [0, 153, 51, 1]);
                        alert(err);
                        defer.reject(err);
                    }
                );
            },
            function initTabError(err){
                console.log('initTab.error:', err);
                console.error('initTab:', err);
                $scope.errorMessage = err;
                $scope.badge('X', [0, 153, 51, 1]);
                alert(err);
                defer.reject(err);
            }
        );
        return defer.promise;
    };

    $scope.removeAll = function() {
        blackInkStorage.removeAll();
    };

    $scope.apply = function(applyCss) {
        alert('apply '+applyCss);
        if(applyCss) {
            $scope.tabService.sendMessage($scope.tabId, {
                type: "css",
                cssId: 'BlackInkColor',
                inkColor: $scope.InkColor,
                textWeight: $scope.TextWeight,
                cssContent:
                    !applyCss ? 
                        '* {'+
                            'color:'+$scope.InkColor+' !important; '+
                            (($scope.TextWeight !== '') ? 'font-weight:'+$scope.TextWeight+' !important; ' : '') +
                          '}'
                        : ''
            });
            $scope.badge('On', [0, 153, 51, 1]);
        }
        else
            $scope.badge('', [0, 153, 51, 0]);        
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

    $scope.fShare = function() {
        window.open("https://www.facebook.com/sharer?u=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fblack-ink%2Fjhpghaenkakfmpfkhokmglbhhooonbeg%3Fhl%3Den%26gl%3DCA", "_blank");
    };
});

