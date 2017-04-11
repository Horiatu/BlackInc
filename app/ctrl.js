angular.module('blackInkApp').controller('BlackInkCtrl', function($scope, $q, $http, blackInkStorage, locationService, sunriseService, tabService) {

	$scope.blackInkStorage = blackInkStorage;
    $scope.locationService = locationService;
    $scope.tabService = tabService;
    $scope.errorMessage = '';
    $scope.tabId = 0;
    $scope.initTabs = [];

    var defaults = {
        InkColor: 'black',
        TextWeight: 'bold',
        ShowHelp: 'inherit',
        NightMode: 'pink',
        AutoNightMode: false,
        Latitude:  43.7303873,
        Longitude:  -79.32944619999999,
        // ShowLocation:  false,
        Sunrise:  null,
        Sunset:  null,

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
                var nightOn = msg.hasNightMode;
                var applyCss = msg.hasManualCss;
                $scope.apply(applyCss, nightOn);
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
        // alert('init');
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
                        // console.log('findAll:', data);
                        $scope.blackInkStorage.Data = data;
                        data.forEachProp(function(k, v) {
                            //console.log('--'+k+':',v ? v.toString() : v);
                            $scope[k] = v;
                        });

                        $scope.Sunrise = $scope.blackInkStorage.Data.Sunrise;
                        $scope.Sunset = $scope.blackInkStorage.Data.Sunset;

                        var completted = $q.defer();
                        
                        locationService.getLocation().then(
                            function locationSuccess(position) {
                                blackInkStorage.add({
                                    Latitude: Math.round(position.latitude*10000)/10000,
                                    Longitude: Math.round(position.longitude*10000)/10000
                                }).then(
                                    function success(override){
                                        // console.log('isToday', override, $scope.Sunrise);
                                        if(override || !$scope.Sunrise || !$scope.Sunrise.isToday()) 
                                        {
                                            sunriseService.getSunrise($scope.Latitude, $scope.Longitude, override).then(
                                                function mySuccess(response) {
                                                    //console.log('mySuccess:', response);
                                                    blackInkStorage.add({
                                                        Sunrise: response.Sunrise,
                                                        Sunset: response.Sunset
                                                    }).then(function() {
                                                        $scope.Sunrise = response.Sunrise;
                                                        $scope.Sunset = response.Sunset;
                                                    });
                                                    completted.resolve();
                                                },
                                                function myError(msg) {
                                                    console.log('getLocation.getSunrise.error:', msg);
                                                    // console.error('getLocation.getSunrise.error:', msg);
                                                    alert('getLocation.getSunrise.error: '+ msg);
                                                    completted.reject(msg);
                                                });
                                        }
                                        else {
                                            completted.resolve();
                                        }
                                    },
                                    function addError(msg) {
                                        console.log('getLocation.add.error:', msg);
                                        // console.error('getLocation.add.error:', msg);
                                        alert('getLocation.add.error: '+ msg);
                                        completted.reject(msg);
                                    }
                                );
                            },
                            function locationError(msg) {
                                console.log('getLocation.error:', msg);
                                // console.error('getLocation.error:', msg);
                                alert('getLocation.error: '+ msg);
                                completted.reject(msg);
                            }

                        );

                        var getDefaultsDefer = $q.defer();
                        
                        completted.promise.then(
                            function completedSuccess() {
                                // console.log('completed');

                                $scope.isNightTime = sunriseService.isNightTime($scope.Sunrise, $scope.Sunset);

                                $scope.tabService.sendMessage($scope.tabId, {type:'getDefaults'},
                                    function(msg) {
                                        // console.log('getDefaults: ',msg);

                                        if(msg) {
                                            getDefaultsDefer.resolve({
                                                nightOn: msg.hasNightMode,
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

                            // chrome.tabs.onSelectionChanged.addListener(function(tabId) {
                            //     $scope.tabId = tabId;
                            // });

                            $scope.nightOn = msgData.nightOn;
                            $scope.applyCss = msgData.applyCss;
                            defer.resolve();
                        });
                    },
                    function blackInkStorageError(err) {
                        // console.log('blackInkStorage.error:', err);
                        // console.error('blackInkStorage:', err);
                        // $scope.errorMessage = err;
                        // // $scope.badge('X', [0, 153, 51, 1]);
                        // alert(err);
                        defer.reject(err);
                    }
                );
            },
            function initTabError(err){
                // console.log('initTab.error:', err);
                // console.error('initTab:', err);
                // $scope.errorMessage = err;
                // // $scope.badge('X', [0, 153, 51, 1]);
                // alert(err);
                defer.reject(err);
            }
        );
        return defer.promise;
    };

    $scope.removeAll = function() {
        blackInkStorage.removeAll();
    };

    $scope.apply = function(applyCss, nightOn) {
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

    $scope.nightMode = function(e) {
        // console.log('nightOn', $scope.nightOn);
        $scope.tabService.sendMessage($scope.tabId, {
            type: "nightMode",
            mode: $scope.nightOn,
            cls: $scope.NightMode
        });
        $scope.badge('On', [0, 153, 51, 1]);
    };

    // $scope.pickElements = function() {
    //     window.close();
    //     $scope.tabService.sendMessage($scope.tabId, {
    //         type: "pick",
    //     });
    // };

    $scope.fShare = function() {
        window.open("https://www.facebook.com/sharer?u=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fblack-ink%2Fjhpghaenkakfmpfkhokmglbhhooonbeg%3Fhl%3Den%26gl%3DCA", "_blank");
    };

    // alert('loaded');
});

