(function () {
    'use strict';

	angular
		.module("blackInkApp", [])
		.directive('myKey', function() {
		    return {
		        restrict: 'EA',
		        replace: true,
		        template: '-All that Html here-'
		    };
		});
		
})(); 