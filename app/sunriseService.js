angular.module('blackInkApp').service('sunriseService', function ($q, $http) {
    var _this = this;
    var _sunrise  = null;
    var _sunset  = null;

    this.getSunrise = function(latitude, longitude) {

        var defer= $q.defer();
        // if(override || $scope.blackInkStorage.Data.Sunset.date != new Date().toLocaleDateString())
        // {
            $http({
                method : "GET",
                url : "http://api.sunrise-sunset.org/json?lat="+latitude+"&lng="+longitude+"&date=today"
            }).then(
            function mySucces(response) {
                _sunrise = response.data.results.sunrise.utcTime2Local();
                _sunset = response.data.results.sunset.utcTime2Local();
                defer.resolve({
                    Sunrise: _sunrise,
                    Sunset: _sunset
                });
            }, 
            function myError(response) {
                defer.reject(response.statusText);
            });
        // } else {
        //     defer.reject('same day');
        // }
        return defer.promise;
    };

    this.isNightTime = function() {
        var now = new Date();
        var isit = _sunrise < now  || now < _sunset;
        // console.log('now:', now, isit);
        return isit;
    };
});