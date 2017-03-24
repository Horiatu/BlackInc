angular.module('blackInkApp').controller('BlackInkCtrl', function($scope, $http, blackInkStorage, locationService, sunriseService, tabService) {

	$scope.blackInkStorage = blackInkStorage;
    $scope.locationService = locationService;
    $scope.tabService = tabService;

    var defaults = {
        InkColor: 'black',
        TextWeight: 'bold',
        ShowHelp: 'inherit',
        NightMode: 'pink',
        AutoNightMode: false,
        Latitude:  43.7303873,
        Longitude:  -79.32944619999999,
        ShowLocation:  false,
        Sunrise:  null,
        Sunset:  null,

        helpTooltip: 'hide help',
        UndoDis: true,
        RedoDis: true,
    };

    //$scope.blackInkStorage.removeAll();

    tabService.initTab(
        [{
            allFrames: false,
            file: true,
            content: "/lib/jquery/jquery-2.1.4.min.js"
        }, {
            allFrames: false,
            file: true,
            content: "/mainTab/blackInkTab.js"
        }]
    ).then(
        function() {
            $scope.blackInkStorage.findAll(defaults).then(
                function(data) {
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

                    locationService.getLocation().then(
                        function locationSuccess(position) {
                            //console.log(position);
                            //locationService.getCity(position.latitude, position.longitude);
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
                                            },
                                            function myError(msg) {
                                                console.log('getLocation.getSunrise.error:', msg);
                                                console.error('getLocation.getSunrise.error:', msg);
                                            });
                                    }
                                },
                                function addError(msg) {
                                    console.log('getLocation.add.error:', msg);
                                    console.error('getLocation.add.error:', msg);
                                }
                            );
                        },
                        function locationError(msg) {
                            console.log('getLocation.error:', msg);
                            console.error('getLocation.error:', msg);
                        }
                    );

                    $scope.isNightTime = sunriseService.isNightTime($scope.Sunrise, $scope.Sunset);
                },
                function(err) {
                    console.log('blackInkStorage.error:', err);
                    console.error('blackInkStorage:', err);
                }
            );
        },
        function(err){
            console.log('initTab.error:', err);
            console.error('initTab:', err);
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
            cssContent:
                '<style id="BlackIncColor" class="BlackInc">* {'+
                    'color:'+$scope.InkColor+' !important; '+
                    (($scope.TextWeight !== '') ? 'font-weight:'+$scope.TextWeight+' !important; ' : '') +
                '}</style>'
        });
    };

});

