angular.module('blackInkApp').controller('BlackInkCtrl', function($scope, $http, blackInkStorage, locationService, sunriseService, tabService) {

	$scope.blackInkStorage = blackInkStorage;
    $scope.locationService = locationService;

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

    $scope.blackInkStorage.findAll(defaults).then(function(data){
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
                blackInkStorage.add({
                    Latitude:  position.latitude,
                    Longitude:  position.longitude
                }).then(
                    function success(override){
                        // console.log('isToday', override, $scope.Sunrise);
                        if(override || !$scope.Sunrise || !$scope.Sunrise.isToday()) 
                        {
                            sunriseService.getSunrise($scope.Latitude, $scope.Longitude, override).then(
                                function mySuccess(response) {
                                    //console.log('mySuccess:', response);
                                    blackInkStorage.add({
                                        Sunrise: response.Sunrise.toString(),
                                        Sunset: response.Sunset.toString()
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
    });


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

    

});

