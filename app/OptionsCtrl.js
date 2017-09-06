angular.module('blackInkApp').controller('BlackInkOptionsCtrl', 
    function($scope, $q, $http, blackInkStorage) {

    $scope.blackInkStorage = blackInkStorage;
    $scope.errorMessage = '';
    $scope.tabId = 0;

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
            data.forEachProp(function(k, v) {
                // console.log('--'+k+':',v ? v.toString() : v);
                $scope[k] = v;
            });

            $scope.Sunrise = $scope.blackInkStorage.Data.Sunrise;
            $scope.Sunset = $scope.blackInkStorage.Data.Sunset;

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
