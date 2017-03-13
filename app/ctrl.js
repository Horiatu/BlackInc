angular.module('blackInkApp').controller('BlackInkCtrl', function($scope, $http, blackInkStorage, sunriseService, tabService) {
	$scope.UndoDis='true'; 
    $scope.RedoDis='true';
    // $scope.InkColor='black';
    // $scope.TextWeight='bold';
    // $scope.ShowHelp='inherit';
    $scope.helpTooltip='hide help';
    $scope.NightMode='pink';
    $scope.Latitude = 43.7303873;
    $scope.Longitude = -79.32944619999999;
    $scope.ShowLocation = false;
    $scope.SunriseTime = null;
    $scope.SunsetTime = null;

	$scope.blackInkStorage = blackInkStorage;

	$scope.$watch('blackInkStorage.Data', function(value) {
		if($scope.blackInkStorage.Data===undefined) return;
		var changed = false;
        if($scope.ShowHelp !== $scope.blackInkStorage.Data.ShowHelp) {
            $scope.ShowHelp = $scope.blackInkStorage.Data.ShowHelp;
            changed = true;
        }
		if($scope.InkColor !== $scope.blackInkStorage.Data.InkColor) {
	        $scope.InkColor = $scope.blackInkStorage.Data.InkColor;
	        changed = true;
	    }
        if($scope.TextWeight !== $scope.blackInkStorage.Data.TextWeight) {
            $scope.TextWeight = $scope.blackInkStorage.Data.TextWeight;
            changed = true;
        }
        if($scope.Latitude !== $scope.blackInkStorage.Data.Latitude) {
            $scope.Latitude = $scope.blackInkStorage.Data.Latitude;
            changed = true;
        }
        if($scope.Longitude !== $scope.blackInkStorage.Data.Longitude) {
            $scope.Longitude = $scope.blackInkStorage.Data.Longitude;
            changed = true;
        }
        $scope.blackInkStorage.sync(changed);
    });

    $scope.$watch('ShowHelp', function(value) {
        var showHelp = $scope.ShowHelp;
        if(showHelp && showHelp !== undefined) {
            $scope.add({'ShowHelp': showHelp});
        }
    });

 	$scope.$watch('InkColor', function(value) {
        var inkColor = $scope.InkColor;
        if(inkColor && inkColor !== undefined) {
        	$scope.add({'InkColor': inkColor});
        }
    });

 	$scope.$watch('TextWeight', function(value) {
        var textWeight = $scope.TextWeight;
        if(textWeight && textWeight !== undefined) {
        	$scope.add({'TextWeight': textWeight});
        }
    });

    $scope.blackInkStorage.findAll({
        InkColor:'black', 
        TextWeight:'bold', 
        ShowHelp:'none',
        NightMode:'pink',
        Latitude: 43.7303873,
        Longitude: -79.32944619999999,
    }).then(function(data){
        // console.log('findAll', data);
        $scope.blackInkStorage.Data=data;
        // console.log('$scope.blackInkStorage.Data', $scope.blackInkStorage.Data);
    });

    $scope.add = function(newContent) {
        blackInkStorage.add(newContent);
    };

    $scope.removeAll = function() {
        blackInkStorage.removeAll();
    };

    // $scope.removeAll();
    // $scope.add({'InkColor': $scope.InkColor, 'TextWeight': $scope.TextWeight});

    $scope.toggleShowHelp = function() {
    	if($scope.ShowHelp==='inherit') {
    		$scope.ShowHelp='none';
		    $scope.helpTooltip='show help';
    	}
    	else {
    		$scope.ShowHelp='inherit';
		    $scope.helpTooltip='hide help';
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

        //$scope.getSunrise(override);
        if(override || !$scope.Sunrise || !$scope.Sunrise.isToday()) {
            sunriseService.getSunrise($scope.Latitude, $scope.Longitude, override).then(
                function mySuccess(response) {
                    console.log('mySuccess:', response);
                    $scope.add({
                        Sunrise: ($scope.Sunrise = response.Sunrise),
                        Sunset: ($scope.Sunset = response.Sunset)
                    });
                },
                function myError(response) {
                    console.log('myError:', response);
                });
        }
    };

    $scope.getSunrise = function(override) {

        if(override || $scope.blackInkStorage.Data.Sunset.date != new Date().toLocaleDateString())
        {
            $http({
                method : "GET",
                url : "http://api.sunrise-sunset.org/json?lat="+$scope.Latitude+"&lng="+$scope.Longitude+"&date=today"
            }).then(function mySucces(response) {
                response.data.results.date = new Date().toLocaleDateString();
                //console.log(response.data.results);
                $scope.add({Sunset: response.data.results});
                // $scope.$apply();
            }, function myError(response) {
                console.log('Sunrise Service Error:',response.statusText);
            });
        }
        $scope.SunriseTime = $scope.blackInkStorage.Data.Sunset.sunrise.utcTime2Local();
        $scope.SunsetTime = $scope.blackInkStorage.Data.Sunset.sunset.utcTime2Local();
    };

});

