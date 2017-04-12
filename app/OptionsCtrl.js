angular.module('blackInkApp').controller('BlackInkOptionsCtrl', function($scope, $q, $http, blackInkStorage, locationService, sunriseService) {//, tabService

	$scope.blackInkStorage = blackInkStorage;
    $scope.locationService = locationService;
    // $scope.tabService = tabService;
    $scope.errorMessage = '';
    $scope.tabId = 0;

    var defaults = {
        InkColor: 'black',
        TextWeight: 'bold',
        ShowHelp: 'inherit',

        applyCss: true,
        nightOn: true,
        nightAuto: false,

        NightMode: 'pink',
        Latitude:  43.7303873,
        Longitude:  -79.32944619999999,
        Sunrise:  null,
        Sunset:  null,

        helpTooltip: 'hide help',
    };

    $scope.version = chrome.runtime.getManifest().version;

    //$scope.blackInkStorage.removeAll();

    $scope.blackInkStorage.findAll(defaults)
    .then(
        function blackInkStorageSuccess(data) {
            console.log('findAll:', data);
            $scope.blackInkStorage.Data = data;
            data.forEachProp(function(k, v) {
                console.log('--'+k+':',v ? v.toString() : v);
                $scope[k] = v;
            });

            //$scope.nightOn = $scope.blackInkStorage.Data.NightOn;
            $scope.Sunrise = $scope.blackInkStorage.Data.Sunrise;
            $scope.Sunset = $scope.blackInkStorage.Data.Sunset;

            $scope.$watch('InkColor', function(value) {
                if(value && value !== undefined) {
                    blackInkStorage.add({'InkColor': value});
                }
            });

            $scope.$watch('TextWeight', function(value) {
                if(value !== null && value !== undefined) {
                    blackInkStorage.add({'TextWeight': value});
                }
            });

            $scope.$watch('NightMode', function(value) {
                if(value && value !== undefined) {
                    blackInkStorage.add({'NightMode': value});
                }
            });

            $scope.$watch('applyCss', function(value) {
                blackInkStorage.add({'applyCss': value});
            });

            $scope.$watch('nightOn', function(value) {
                blackInkStorage.add({'nightOn': value});
            });

            $scope.$watch('nightAuto', function(value) {
                blackInkStorage.add({'nightAuto': value});
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

    $scope.nightMode = function(e) {
        console.log($scope.nightOn);
        // $scope.tabService.sendMessage({
        //     type: "nightMode",
        //     mode: $scope.nightOn,
        //     cls: $scope.NightMode
        // });
        // $scope.badge('On', [0, 153, 51, 1]);
    };

    $scope.fShare = function() {
        window.open("https://www.facebook.com/sharer?u=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fblack-ink%2Fjhpghaenkakfmpfkhokmglbhhooonbeg%3Fhl%3Den%26gl%3DCA","", "top=40,left=40,width=640,height=480");
    };

    // alert('loaded');
});

