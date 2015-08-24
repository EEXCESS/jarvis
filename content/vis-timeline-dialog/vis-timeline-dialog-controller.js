(function () {
    'use strict';

    var _groupByProvider = function (collection) {
        var returns = {};
        _.map(collection, function (o) {
            var key_val = o.documentBadge.provider;
            if (!(key_val in returns)) {
                returns[key_val] = {};
                returns[key_val].query = decodeURIComponent(o.generatingQuery);
                returns[key_val].results = [];
            }
            returns[key_val].results.push(o);
        });
        return returns;
    }

    function VisListDialogCtrl($scope, $mdDialog, keywords, results, resultNumbers) {
        $scope.keywords = keywords;
        $scope.results = _groupByProvider(results);
        $scope.resultNums = resultNumbers;
        $scope.selectedTab = 0;
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
        .controller('VisListDialogCtrl', VisListDialogCtrl)
        .filter("hasPreviewImage", function(){
            return function(collection){
                var returns = [];
                _.each(collection, function (o) {
                        if (o.previewImage)
                            returns.push(o);
                    });
                return returns;
            }

        })
        .filter("matchKeywordsFilter", function () {
                return function (keywords, item){
                    var returns = [];
                    _.each(keywords, function (kw) {
                        if (_.max(_.map(item, function (value, key){
                                        if (value && value.toLowerCase && key != "documentBadge" && key != "generatingQuery"){
                                            return value.toLowerCase().indexOf(kw.toLowerCase());
                                        }
                                        return -1;
                                    })
                                 )>-1)
                            returns.push(kw);
                    });
                return returns;
                }
            }
        )
})();