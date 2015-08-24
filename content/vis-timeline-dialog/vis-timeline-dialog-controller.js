(function () {
    'use strict';

    var _extractEvents = function (collection) {
        var returns = [];
        _.map(collection, function (o) {
            if (o.date != "unknown" ){
                var date = moment(o.date);
                if (date && date.isValid()) {
                    var event = {};
                    var start_date = {};
                    start_date["year"] = date.year().toString();
                    event["start_date"] = start_date;

                    var text = {};
                    text["headline"] = o.title;
                    text["text"] = o.description;
                    if (!text["text"]) text["text"] = "";
                    event["text"] = text;

                    if (o.previewImage) {
                        var media = {};
                        media["caption"] = o.title;
                        media["credit"] = "Licenced by "+ o.documentBadge.prvoider + " under " + o.licence;
                        media["url"] = o.previewImage;
                        event["media"] = media;

                    }
                    returns.push(event);
                }

            }


        });
        return returns;
    }

    function VisTimelineDialogCtrl($scope, $mdDialog, keywords, results) {
        $scope.keywords = keywords;
        //$scope.results = _groupByProvider(results);
        $scope.videoFallback = "http://europeanastatic.eu/api/image?uri=http%3A%2F%2Fbdh-rd.bne.es%2Fimg%2Fvideo.png&size=FULL_DOC&type=VIDEO";
        $scope.textFallback = "http://europeanastatic.eu/api/image?uri=http%3A%2F%2Fbdh-rd.bne.es%2Fimg%2Ftext.png&size=FULL_DOC&type=TEXT";
        $scope.imageFallback = "http://europeanastatic.eu/api/image?uri=http%3A%2F%2Fbdh-rd.bne.es%2Fimg%2Fimage.png&size=FULL_DOC&type=IMAGE";

        $scope.timelineData = {
            "title": {
                "text": {
                    "headline": "Timeline for",
                    "text": keywords.words.join(", ")
                }
            },
            "events": _extractEvents(results)
        };

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
        .controller('VisTimelineDialogCtrl', VisTimelineDialogCtrl);
})();