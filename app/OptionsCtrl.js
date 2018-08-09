(function(i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function() {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
    m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)

})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga'); // Note: https protocol here

ga('create', 'UA-109917224-3', 'auto');
ga('set', 'checkProtocolTask', function() {}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
ga('require', 'displayfeatures');
ga('send', 'pageview', '/Options.html');



var OptionsCtrl = angular.module('blackInkApp');
OptionsCtrl.directive('resized', ['$window', function($window) {

    return {
        link: link,
        restrict: 'EA'
    };

    function link(scope, element, attrs) {
        scope.isNavMenuVisible = $window.getComputedStyle(document.getElementById('burgerMenu'), null).display !== 'none';

        angular.element($window).bind('resize', function() {
            scope.isNavMenuVisible = $window.getComputedStyle(document.getElementById('burgerMenu'), null).display !== 'none';
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
            InkColor: 'none',
            TextWeight: 'bold',
            linkStyle: 1,
            ShowHelp: 'inherit',

            keyCtrl: true,
            keyShift: true,
            keyAlt: false,

            QTopics: true,
            QStories: true,
            QPromo: true,

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
                        if (value && value !== undefined) {
                            if (ga && blackInkStorage.Data.InkColor !== value) ga('send', 'event', 'InkColor', value);
                            blackInkStorage.add({
                                'InkColor': value
                            });
                        }
                    });

                    $scope.$watch('TextWeight', function(value) {
                        if (value !== null && value !== undefined) {
                            if (ga && blackInkStorage.Data.TextWeight !== value) ga('send', 'event', 'TextWeight', value);
                            blackInkStorage.add({
                                'TextWeight': value
                            });
                        }
                    });

                    $scope.$watch('linkStyle', function(value) {
                        if (value !== null && value !== undefined) {
                            if (ga && blackInkStorage.Data.linkStyle !== value) ga('send', 'event', 'LinkStyle', value);
                            blackInkStorage.add({
                                'linkStyle': value
                            });
                        }
                    });

                    $scope.$watch('keyCtrl', function(checked) {
                        if (ga && blackInkStorage.Data.keyCtrl !== value) ga('send', 'event', 'keyCtrl', checked);
                        blackInkStorage.add({
                            'keyCtrl': checked
                        });
                    });
                    $scope.$watch('keyShift', function(checked) {
                        if (ga && blackInkStorage.Data.keyShift !== value) ga('send', 'event', 'keyShift', checked);
                        blackInkStorage.add({
                            'keyShift': checked
                        });
                    });
                    $scope.$watch('keyAlt', function(checked) {
                        if (ga && blackInkStorage.Data.keyAlt !== value) ga('send', 'event', 'keyAlt', checked);
                        blackInkStorage.add({
                            'keyAlt': checked
                        });
                    });

                    $scope.$watch('QTopics', function(checked) {
                        if (ga && blackInkStorage.Data.QTopics !== checked) ga('send', 'event', 'QTopics', checked);
                        blackInkStorage.add({
                            'QTopics': checked
                        });
                    });
                    $scope.$watch('QStories', function(checked) {
                        if (ga && blackInkStorage.Data.QStories !== checked) ga('send', 'event', 'QStories', checked);
                        blackInkStorage.add({
                            'QStories': checked
                        });
                    });
                    $scope.$watch('QPromo', function(checked) {
                        if (ga && blackInkStorage.Data.QPromo !== checked) ga('send', 'event', 'QPromo', checked);
                        blackInkStorage.add({
                            'QPromo': checked
                        });
                    });

                    $scope.$watch('applyCss', function(value) {
                        blackInkStorage.add({
                            'applyCss': value
                        });
                    });

                    $scope.$watch('errorMessage', function(value) {
                        if (value) {
                            alert('Error: ' + value);
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
                     if (ga) ga('send', 'event', 'Storage Error', err);
                    $scope.errorMessage = err;
                }
            );

        $scope.removeAll = function() {
            blackInkStorage.removeAll();
        };

        $scope.toggleShowHelp = function() {
            if ($scope.ShowHelp === 'none') {
                $scope.ShowHelp = 'inherit';
            } else {
                $scope.ShowHelp = 'none';
            }
        };

        $scope.closeExtension = function() {
            window.close();
        };

        $scope.fShare = function() {
            ga('send', 'event', 'share', 'facebook');
            window.open("https://www.facebook.com/sharer?u=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fblack-ink%2Fjhpghaenkakfmpfkhokmglbhhooonbeg%3Fhl%3Den%26gl%3DCA", "", "top=40,left=40,width=640,height=480");
        };

        $scope.refresh = function() {
            $scope.blackInkStorage.removeAll();
        };

        // alert('loaded');
    });