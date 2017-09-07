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

	.directive('scroll', function ($window) {
	    return function(scope, element, attrs) {
	        angular.element($window).bind("scroll", function() {
	            if (this.pageYOffset >= 10) {
	                scope.boolChangeClass = true;
	                // console.log('Scrolled below header.');
	            } else {
	                scope.boolChangeClass = false;
	                // console.log('Header is in view.');
	            }
	            scope.$apply();
	        });
	    };
	})

	.directive('scrollIf', function () {
			return function (scope, element, attributes) {
			setTimeout(function () {
      			if (scope.$eval(attributes.scrollIf)) {
	        		alert(element[0].offsetTop+150);
	        		window.scrollTo(0, element[0].offsetTop+150);
		      	}
	    	});
	    };
	});
		
})(); 