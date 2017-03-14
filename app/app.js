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
		})

		.directive('onClassChange', function() {
			return {
				restrict: 'AC',
				link: function(scope, element, attrs) { 

					if (attrs.onClassChange.indexOf(':')>0) { 
						var cc = attrs.onClassChange.split(':');
						var cls = cc[0].trim();
						var fnc = cc[1].trim().replace(/\(\s*\)$/g,'');
						scope.$watch(function() {return element.attr('class'); }, function(newValue){
							console.log("scope.$watch:", newValue);
							var vv = newValue.split(' ');

							scope[fnc].call(scope, element, cls, vv.indexOf(cls)>=0);
						});
					}
				}
			};
		});
		
})(); 