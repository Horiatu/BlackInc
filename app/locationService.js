angular.module('blackInkApp').service('locationService', function ($q) {
    var _this = this;

    this.getLocation = function () {
        var defer = $q.defer();
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
            	defer.resolve(position.coords);
            	// http://api.geonames.org/findNearbyPlaceName?lat=43.8052&lng=-79.3550&username=demo&cities=cities15000
            });
        } else { 
            defer.reject("Geolocation is not supported by this browser.");
        }

        return defer.promise;
    };

 //    this.getCity = function(lat, lng) {
 //    	var latlng = new google.maps.LatLng(lat, lng);
	//     geocoder.geocode({'latLng': latlng}, function(results, status) {
	//       	if (status == google.maps.GeocoderStatus.OK) {
	// 	      	console.log(results);
	// 	        if (results[1]) {
	// 	        	//formatted address
	// 		        alert(results[0].formatted_address);
	// 		        //find country name
	// 	            for (var i=0; i<results[0].address_components.length; i++) {
	// 		            for (var b=0;b<results[0].address_components[i].types.length;b++) {

	// 		            //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
	// 		                if (results[0].address_components[i].types[b] == "administrative_area_level_1") {
	// 		                    //this is the object you are looking for
	// 		                    city= results[0].address_components[i];
	// 		                    break;
	// 		                }
	// 		            }
	// 		        }
	// 		        //city data
	// 		        alert(city.short_name + " " + city.long_name);


	// 	        } else {
	// 	          	alert("No results found");
	// 	        }
	//       	} else {
	//         	alert("Geocoder failed due to: " + status);
	//       	}
	//     });
	// };
});