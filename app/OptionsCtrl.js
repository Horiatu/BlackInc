angular.module('blackInkApp').controller('BlackInkOptionsCtrl', function($scope, $q, $http, blackInkStorage) {//, tabService

	$scope.blackInkStorage = blackInkStorage;
    $scope.errorMessage = '';
    $scope.tabId = 0;

    var defaults = {
        InkColor: 'black',
        TextWeight: 'bold',

        applyCss: true,
    };

    $scope.version = chrome.runtime.getManifest().version;

    // $scope.blackInkStorage.removeAll();

    $scope.blackInkStorage.findAll(defaults)
    .then(
        function blackInkStorageSuccess(data) {
            console.log('findAll:', data);
            $scope.blackInkStorage.Data = data;
            data.forEachProp(function(k, v) {
                // console.log('--'+k+':',v ? v.toString() : v);
                $scope[k] = v;
            });

            $scope.$watch('InkColor', function(value) {
                if(value && value !== undefined) {
                    blackInkStorage.add({'InkColor': value});
                }
            });

            $scope.$watch('TextWeight', function(value) {
                if(value && value !== undefined) {
                    blackInkStorage.add({'TextWeight': value});
                }
            });

            $scope.$watch('NightMode', function(value) {
                if(value && value !== undefined) {
                    blackInkStorage.add({'TextWeight': value});
                }
            });

            $scope.$watch('applyCss', function(value) {
                blackInkStorage.add({'applyCss': value});
            });

            // var completted = $q.defer();
            
            // completted.promise.then(
            //     function completedSuccess() {
                    console.log('completed');

                    // $scope.isNightTime = sunriseService.isNightTime($scope.Sunrise, $scope.Sunset);
                // },
                // function completedError(msg) {
                //     console.log('completed Error ', msg);
                // }
            // );

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

    $scope.fShare = function() {
        window.open("https://www.facebook.com/sharer?u=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fblack-ink%2Fjhpghaenkakfmpfkhokmglbhhooonbeg%3Fhl%3Den%26gl%3DCA","", "top=40,left=40,width=640,height=480");
    };

    $scope.Refresh = function() {
        $scope.blackInkStorage.removeAll();
    };

    // alert('loaded');
});

