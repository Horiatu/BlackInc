angular.module('blackInkApp').controller('BlackInkCtrl', function($scope, $q, $http, blackInkStorage, locationService, sunriseService, tabService) {

	$scope.blackInkStorage = blackInkStorage;
    $scope.locationService = locationService;
    $scope.tabService = tabService;
    $scope.errorMessage = '';

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
        // UndoDis: true,
        // RedoDis: true,
    };

    //$scope.blackInkStorage.removeAll();

    tabService.initTab([
        {
            allFrames: false,
            file: true,
            content: "/lib/jquery/jquery-2.1.4.min.js"
        }, 
        {
            allFrames: false,
            file: true,
            content: "/lib/jquery/jquery-ui.min.js"
        }, 
        {
            allFrames: false,
            file: true,
            content: "/mainTab/blackInkTab.js"
        }
    ]).then(
        function() {
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

                    $scope.$watch('InkColor', function(value) {
                        if(value && value !== undefined) {
                            blackInkStorage.add({'InkColor': value});
                        }
                    });

                    $scope.$watch('TextWeight', function(value) {
                        if(value && value !== undefined) {
                            blackInkStorage.add({'TextWeight': value});
                        }
                    });

                    $scope.$watch('ShowHelp', function(value) {
                        if(value && value !== undefined) {
                            blackInkStorage.add({'ShowHelp': value});
                            $scope.helpTooltip = (value==='none') ? 'Show Help' : 'Hide Help';
                        }
                    });

                    $scope.$watch('NightMode', function(value) {
                        if(value && value !== undefined) {
                            blackInkStorage.add({'NightMode': value});
                        }
                    });

                    $scope.$watch('AutoNightMode', function(value) {
                        if(value && value !== undefined) {
                            blackInkStorage.add({'AutoNightMode': value});
                        }
                    });

                    $scope.$watch('Invert', function(value) {
                        //alert('Invert: '+ value);
                        $scope.tabService.sendMessage({
                            'type': 'invert', 
                            'mode': value
                        });
                    });

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
                                                console.error('getLocation.getSunrise.error:', msg);
                                                completted.reject(msg);
                                            });
                                    }
                                    else {
                                        completted.resolve();
                                    }
                                },
                                function addError(msg) {
                                    console.log('getLocation.add.error:', msg);
                                    console.error('getLocation.add.error:', msg);
                                    completted.reject(msg);
                                }
                            );
                        },
                        function locationError(msg) {
                            console.log('getLocation.error:', msg);
                            console.error('getLocation.error:', msg);
                            completted.reject(msg);
                        }

                    );

                    var getDefaultsDefer = $q.defer();
                    
                    completted.promise.then(
                        function completedSuccess() {
                            console.log('completed');

                            $scope.isNightTime = sunriseService.isNightTime($scope.Sunrise, $scope.Sunset);

                            $scope.tabService.sendMessage({type:'getDefaults'},
                                function(msg) {
                                    console.log('getDefaults: ',msg);

                                    if(msg) {
                                        getDefaultsDefer.resolve({
                                            nightOn: msg.hasNightMode,
                                            applyCss: msg.hasManualCss
                                        });
                                    }
                                    else {
                                        console.log('setDefaults');
                                        $scope.tabService.sendMessage({
                                            type:'setDefaults',
                                            inkColor: $scope.InkColor,
                                            textWeight: $scope.TextWeight,
                                        });
                                    }
                                }
                            );
                        },
                        function completedError(msg) {
                            console.log('completed Error ',msg);
                        }
                    );

                    getDefaultsDefer.promise.then(function(msgData) {
                        $scope.nightOn = msgData.nightOn;
                        $scope.applyCss = msgData.applyCss;
                    });
                },
                function blackInkStorageError(err) {
                    console.log('blackInkStorage.error:', err);
                    console.error('blackInkStorage:', err);
                    $scope.errorMessage = err;
                }
            );
        },
        function initTabError(err){
            console.log('initTab.error:', err);
            console.error('initTab:', err);
            $scope.errorMessage = err;
        }
    );


    // $scope.add = function(newContent) {
    //     blackInkStorage.add(newContent);
    // };

    $scope.removeAll = function() {
        blackInkStorage.removeAll();
    };

    $scope.toggleShowHelp = function() {
    	if($scope.ShowHelp === 'none') {
    		$scope.ShowHelp = 'inherit';
    	}
    	else {
    		$scope.ShowHelp = 'none';
    	}
    };

    $scope.closeExtension = function() {
    	window.close();
    };

    $scope.locationShowing = function(element, cls, show) {
        console.log('locationShowing', element, cls, show);
        if(show) {
            console.log('isNightTime:', sunriseService.isNightTime($scope.Sunrise, $scope.Sunset));
        }
    };

    $scope.apply = function() {
        $scope.tabService.sendMessage({
            type: "css",
            cssId: 'BlackIncColor',
            inkColor: $scope.InkColor,
            textWeight: $scope.TextWeight,
            cssContent:
                $scope.applyCss 
                    ? '* {'+
                        'color:'+$scope.InkColor+' !important; '+
                        (($scope.TextWeight !== '') ? 'font-weight:'+$scope.TextWeight+' !important; ' : '') +
                      '}'
                    : ''
        });
    };

    $scope.nightMode = function(e) {
        console.log($scope.nightOn);
        $scope.tabService.sendMessage({
            type: "nightMode",
            mode: $scope.nightOn,
            cls: $scope.NightMode
        });
    };

    $scope.pickElements = function() {
        window.close();
        $scope.tabService.sendMessage({
            type: "pick",
        });
    };

    $scope.fShare = function() {
        window.open("https://www.facebook.com/sharer?u=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fblack-ink%2Fjhpghaenkakfmpfkhokmglbhhooonbeg%3Fhl%3Den%26gl%3DCA", "_blank");
    };

});

