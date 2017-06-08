angular.module('blackInkApp').service('sunriseService', function ($q, $http) {
    // var _this = this;

    this.getSunrise = function(latitude, longitude) {

        var defer= $q.defer();
        $http({
            method : "GET",
            url : "http://api.sunrise-sunset.org/json?lat="+latitude+"&lng="+longitude+"&date=today"
        }).then(
        function mySucces(response) {
            var sunData = {
                Sunrise: response.data.results.sunrise.utcTime2Local(),
                Sunset: response.data.results.sunset.utcTime2Local()
            };
            console.log('getSunrise:', sunData);
            defer.resolve(sunData);
        }, 
        function myError(response) {
            console.log(response.statusText);
            defer.reject(response.statusText);
        });
        return defer.promise;
    };

    this.isNightTime = function(sunrise, sunset) {
        var now = new Date();
        var isit = sunrise > now || now > sunset;
        // console.log('now:', now, isit);
        // console.log('sunrise:', sunrise, sunrise > now);
        // console.log('sunset:', sunset, now > sunset);
        return isit;
    };
});