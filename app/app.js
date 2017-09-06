(function () {
    'use strict';

	angular.module("blackInkApp", ['ngAria'])
	
		.directive('myKey', function() {
		    return {
		        restrict: 'EA',
		        replace: true,
		        template: '-All that Html here-'
		    };
		})

		.directive('scrollIf', function () {
  			return function (scope, element, attributes) {
    			setTimeout(function () {
      			if (scope.$eval(attributes.scrollIf)) {
        		window.scrollTo(0, element[0].offsetTop - 100);
	      	}
    	});
    };
});
		
})(); 