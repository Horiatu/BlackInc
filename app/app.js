(function () {
    'use strict';

	angular
		.module("blackInkApp", [])

		.directive('toggleClass', function() { 
			return { 
				restrict: 'A', 
				link: function(scope, element, attrs) { 
					element.bind('click', function() { 
						if (attrs.toggleClassOn) { 
							var e = document.querySelectorAll(attrs.toggleClassOn); 
							angular.element(e).toggleClass(attrs.toggleClass); 
						} 
						else 
						{ 
							element.toggleClass(attrs.toggleClass); 
						} 
					}); 
				} 
			}; 
		});
		
})(); 