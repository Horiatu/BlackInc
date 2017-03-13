angular.module('blackInkApp').service('sunriseService', function ($q, $http) {
    var _this = this;

    this.getSunrise = function(latitude, longitude) {

        var defer= $q.defer();
        // if(override || $scope.blackInkStorage.Data.Sunset.date != new Date().toLocaleDateString())
        // {
            $http({
                method : "GET",
                url : "http://api.sunrise-sunset.org/json?lat="+latitude+"&lng="+longitude+"&date=today"
            }).then(
            function mySucces(response) {
                defer.resolve({
                    Sunrise: response.data.results.sunrise.utcTime2Local(),
                    Sunset: response.data.results.sunset.utcTime2Local()
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
});