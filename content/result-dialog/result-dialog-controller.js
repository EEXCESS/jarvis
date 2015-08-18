(function () {
    'use strict';

    function ResultDialogCtrl($scope, $mdDialog, results, selectedTab, resultNumbers) {
        $scope.results = results;
        $scope.selectedTab = selectedTab;
        $scope.resultNums = resultNumbers;
        $scope.videoFallback = "http://europeanastatic.eu/api/image?uri=http%3A%2F%2Fbdh-rd.bne.es%2Fimg%2Fvideo.png&size=FULL_DOC&type=VIDEO";
        $scope.textFallback = "http://europeanastatic.eu/api/image?uri=http%3A%2F%2Fbdh-rd.bne.es%2Fimg%2Ftext.png&size=FULL_DOC&type=TEXT";
        $scope.imageFallback = "http://europeanastatic.eu/api/image?uri=http%3A%2F%2Fbdh-rd.bne.es%2Fimg%2Fimage.png&size=FULL_DOC&type=IMAGE";

        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.isUri = function (string) {
                var pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
                return pattern.test(string);
        }
    }

    angular
        .module('Jarvis')
        .controller('ResultDialogCtrl', ResultDialogCtrl);

})();