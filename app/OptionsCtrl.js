// var _gaq = _gaq || [];
// _gaq.push(['_setAccount', 'UA-109917224-3']);
// _gaq.push(['_trackPageview']);

// (function() {
//     var ga = document.createElement('script');
//     ga.type = 'text/javascript';
//     ga.async = true;
//     ga.src = 'https://ssl.google-analytics.com/ga.js';
//     var s = document.getElementsByTagName('script')[0];
//     s.parentNode.insertBefore(ga, s);
// })();

var OptionsCtrl = angular.module('blackInkApp');
OptionsCtrl.directive('resized', ['$window', function ($window) {

     return {
        link: link,
        restrict: 'EA'
     };

     function link(scope, element, attrs){
        scope.isNavMenuVisible = $window.getComputedStyle(document.getElementById('burgerMenu'), null).display != 'none';

        angular.element($window).bind('resize', function(){
            scope.isNavMenuVisible = $window.getComputedStyle(document.getElementById('burgerMenu'), null).display != 'none';
            scope.$digest(); // manuall $digest required as resize event is outside of angular
        });
    }
}]);

OptionsCtrl.directive('myKey', function() {
    return {
        restrict: 'EA',
        replace: true,
        template: '-All that Html here-'
    };
});

// OptionsCtrl.directive('scroll', function ($window) {
//     return function(scope, element, attrs) {
//         angular.element($window).bind("scroll", function() {
//             if (this.pageYOffset >= 10) {
//                 scope.boolChangeClass = true;
//             } else {
//                 scope.boolChangeClass = false;
//             }
//             scope.$apply();
//         });
//     };
// });

OptionsCtrl.controller('BlackInkOptionsCtrl', 
    function($scope, $q, $http, blackInkStorage) {

    $scope.blackInkStorage = blackInkStorage;
    $scope.errorMessage = '';
    $scope.tabId = 0;
    $scope.isNavMenuVisible = false;

    var defaults = {
        InkColor: 'black',
        TextWeight: 'bold',
        linkStyle: 1,
        ShowHelp: 'inherit',

        keyCtrl: true,
        keyShift: true,
        keyAlt: false,

        applyCss: false,

        helpTooltip: 'hide help',
    };

    $scope.version = chrome.runtime.getManifest().version;

    $scope.blackInkStorage.findAll(defaults)
    .then(
        function blackInkStorageSuccess(data) {
            // console.log('findAll:', data);
            $scope.blackInkStorage.Data = data;
            forEachProp(data, function(k, v) {
                // console.log('--'+k+':',v ? v.toString() : v);
                $scope[k] = v;
            });

            $scope.$watch('InkColor', function(value) {
                if(value && value !== undefined) {
                    blackInkStorage.add({'InkColor': value});
                }
            });

            $scope.$watch('TextWeight', function(value) {
                if(value !== null && value !== undefined) {
                    blackInkStorage.add({'TextWeight': value});
                }
            });

            $scope.$watch('linkStyle', function(value) {
                if(value !== null && value !== undefined) {
                    blackInkStorage.add({'linkStyle': value});
                }
            });

            $scope.$watch('keyCtrl', function(checked) {
                blackInkStorage.add({'keyCtrl': checked});
            });
            $scope.$watch('keyShift', function(checked) {
                blackInkStorage.add({'keyShift': checked});
            });
            $scope.$watch('keyAlt', function(checked) {
                blackInkStorage.add({'keyAlt': checked});
            });

            $scope.$watch('applyCss', function(value) {
                blackInkStorage.add({'applyCss': value});
            });

            $scope.$watch('errorMessage', function(value) {
                if(value) {
                    alert('Error: '+value);
                    console.log("errorMessage", value);
                }
            });

            var getDefaultsDefer = $q.defer();
            
            getDefaultsDefer.promise.then(function(msgData) {
                $scope.applyCss = msgData.applyCss;
            });
        },

        function blackInkStorageError(err) {
            console.log('blackInkStorage.error:', err);
            console.error('blackInkStorage:', err);
            $scope.errorMessage = err;
        }
    );

    $scope.removeAll = function() {
        blackInkStorage.removeAll();
    };

    $scope.toggleShowHelp = function() {
        if($scope.ShowHelp === 'none') {
            $scope.ShowHelp = 'inherit';
        }
        else {
            $scope.ShowHelp = 'none';
        }
    };

    $scope.closeExtension = function() {
        window.close();
    };

    $scope.fShare = function() {
        window.open("https://www.facebook.com/sharer?u=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fblack-ink%2Fjhpghaenkakfmpfkhokmglbhhooonbeg%3Fhl%3Den%26gl%3DCA","", "top=40,left=40,width=640,height=480");
    };

    $scope.refresh = function() {
        $scope.blackInkStorage.removeAll();
    };

    // alert('loaded');
});
