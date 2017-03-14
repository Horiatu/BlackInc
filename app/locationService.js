angular.module('blackInkApp').service('locationService', function ($q) {
    var _this = this;

    this.getLocation = function () {
        var defer = $q.defer();
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
            	defer.resolve(position.coords);
            });
        } else { 
            defer.reject("Geolocation is not supported by this browser.");
        }

        return defer.promise;
    };


});