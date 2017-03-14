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
        console.log('findAll', data);
        $scope.blackInkStorage.Data = data;
        data.forEachProp(function(k, v) {
            //console.log('--'+k+':',v ? v.toString() : v);
            $scope[k] = v;
        });

        $scope.$watch('InkColor', function(value) {
            if(value && value !== undefined) {
                $scope.add({'InkColor': value});
            }
        });

        $scope.$watch('TextWeight', function(value) {
            if(value && value !== undefined) {
                $scope.add({'TextWeight': value});
            }
        });

        $scope.$watch('ShowHelp', function(value) {
            if(value && value !== undefined) {
                $scope.add({'ShowHelp': value});
                $scope.helpTooltip = (value==='none') ? 'Show Help' : 'Hide Help';
            }
        });

        $scope.$watch('NightMode', function(value) {
            if(value && value !== undefined) {
                $scope.add({'NightMode': value});
            }
        });

        $scope.$watch('AutoNightMode', function(value) {
            if(value && value !== undefined) {
                $scope.add({'AutoNightMode': value});
            }
        });

        locationService.getLocation().then(
            function success(position) {
                console.log(position);
                $scope.add({
                    Latitude:  position.latitude,
                    Longitude:  position.longitude
                });
            },
            function error(msg) {
                console.log(msg);
                console.error(msg);
            }
        );

    });


    $scope.add = function(newContent) {
        blackInkStorage.add(newContent);
    };

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


    $scope.getLocation = function () {
        // var _this = this;
        var override = false;
        var showPosition = function (position) {

            var precision = 3;
            if($scope.Latitude.toFixed(precision) != position.coords.latitude.toFixed(precision)) {
                //console.log('Latitude:', $scope.Latitude.toFixed(precision), position.coords.latitude.toFixed(precision));
                $scope.add({Latitude: $scope.Latitude = position.coords.latitude});
                override = true;
            }
            if($scope.Longitude.toFixed(precision) != position.coords.longitude.toFixed(precision)) {
                //console.log('Longitude:', $scope.Longitude.toFixed(precision), position.coords.longitude.toFixed(precision));
                $scope.add({Longitude: $scope.Longitude = position.coords.longitude});
                override = true;
            }
            
            if(override) 
            {
                $scope.$apply();
            }
            //console.log('Latitude: '+ position.coords.latitude+' Longitude: '+position.coords.longitude+' '+override);
        };

        $scope.ShowLocation = !$scope.ShowLocation;
        if(!$scope.ShowLocation) return;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        } else { 
            alert("Geolocation is not supported by this browser.");
        }

        // if(override || !$scope.Sunrise || !$scope.Sunrise.isToday()) 
        {
            console.log('isToday', override, $scope.Sunrise);
            sunriseService.getSunrise($scope.Latitude, $scope.Longitude, override).then(
                function mySuccess(response) {
                    console.log('mySuccess:', response);
                    $scope.Sunrise = response.Sunrise;
                    $scope.Sunset = response.Sunset;
                    $scope.add({
                        Sunrise: response.Sunrise.toString(),
                        Sunset: response.Sunset.toString()
                    });
                },
                function myError(response) {
                    console.log('myError:', response);
                });
        }
    };

});

