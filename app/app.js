(function () {
    'use strict';

	angular
		.module("blackInkApp", [])

		.directive('toggleClass', function() { 
			return { 
				restrict: 'A', 
				link: function(scope, element, attrs) { 
					element.bind('click', function() { 
						if (attrs.toggleClass.indexOf(':')>0) { 
							var cc = attrs.toggleClass.split(':');
							var e = document.querySelectorAll(cc[1].trim()); 
							angular.element(e).toggleClass(cc[0].trim()); 
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