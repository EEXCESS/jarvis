(function() {
    'use strict';

    function ParagraphCtrl($scope, $sce, $mdDialog, HighlightService,
                           MessageService, Utils, ParagraphDetectionService,
                           ContentScriptSettings) {
        var _extID = Utils.getExtID();
        // the paragraph wrapped by the directive
        var paragraph = ParagraphDetectionService.getParagraph($scope.id);

        // icons that are used in the directive
        $scope.icons = {};
        $scope.icons.search = $sce.trustAsResourceUrl('chrome-extension://' + _extID + '/media/icons/search-icon.svg');
        $scope.icons.play = $sce.trustAsResourceUrl('chrome-extension://' + _extID + '/media/icons/play-icon.svg');
        $scope.icons.image = $sce.trustAsResourceUrl('chrome-extension://' + _extID + '/media/icons/image-icon.svg');
        $scope.icons.text = $sce.trustAsResourceUrl('chrome-extension://' + _extID + '/media/icons/text-icon.svg');
        $scope.icons.video = $sce.trustAsResourceUrl('chrome-extension://' + _extID + '/media/icons/video-icon.svg');
        $scope.icons.unassinged = $sce.trustAsResourceUrl('chrome-extension://' + _extID + '/media/icons/unknown-icon.svg');

        // Must be a deep object to prevent problems with the watcher
        $scope.keywords = {};
        $scope.keywords.words = [];
        $scope.newKeywords = true;
        $scope.resultNumbers = {};

        $scope.$watch(
          // This is the important part
          function() {
            return ContentScriptSettings;
          },

          function(newValue, oldValue) {
            console.log('Content Script Settings Changed (new, old)', newValue, oldValue);
              if ($scope.showPlugin != ContentScriptSettings.showJarvis()) {
                  $scope.showPlugin = ContentScriptSettings.showJarvis();
                  $scope.$apply();
              }
          },
          true
        );

        var queryResults = undefined;
        $scope.showPlugin = ContentScriptSettings.showJarvis();

        // Load the initial value from the storage
        chrome.storage.sync.get('Jarvis', function(data) {
            if (data.Jarvis !== undefined) {
                $scope.showPlugin = data.Jarvis;
            }
        });

        // Set listener who listens for changes in the storage
        chrome.storage.onChanged.addListener(function(changes) {
            if (changes.Jarvis && changes.Jarvis.newValue !== undefined) {
                $scope.showPlugin = changes.Jarvis.newValue;

                // reset the application
                if (!$scope.showPlugin) {
                    HighlightService.removeHighlight($scope.id);
                    $scope.keywords.words = [];
                    $scope.resultNumbers.textResults = 0;
                    $scope.resultNumbers.imageResults = 0;
                    $scope.resultNumbers.avResults = 0;
                    queryResults = undefined;
                }
                $scope.$apply();
            }
        });

        // Searches for keywords and sends a query to europeana afterwards
        $scope.query = function() {
            if ($scope.keywords.words.length === 0) {
                // outgoing paragraph has to be in a list. this is requested by the api of the REST service
                var outgoingParagraph = [paragraph];

                MessageService.callBG({
                    method: {service: 'KeywordService', func: 'getParagraphEntities'},
                    data: outgoingParagraph
                }, function(result) {
                    if (result.type === 'success') {
                        angular.forEach(result.data, function(elem) {
                            if ($scope.keywords.words.indexOf(elem) === -1) {
                                $scope.keywords.words.push(elem.keyword);
                            }
                        });

                        if ($scope.keywords.words.length !== 0) {
                            $scope.newKeywords = false;
                            _queryRecommender();
                        } else {
                            $mdDialog.show(
                                $mdDialog.alert()
                                    .parent(angular.element(document.body))
                                    .title('No keywords found')
                                    .content('The automatic search did not find any keywords. You have to add them on your own.')
                                    .ariaLabel('Error Dialog')
                                    .ok('Ok')
                            );
                        }
                    } else {
                        _showAlertDialog('Entity Service');
                    }
                });
            } else {
                _queryRecommender();
            }
        };

        // Watch for keyword changes to highlight the current keywords
        $scope.$watch('keywords.words', function(newVal, oldVal) {
            HighlightService.removeHighlight($scope.id);
            angular.forEach($scope.keywords.words, function(keyword) {
                HighlightService.highlight($scope.id, keyword);
            });

            // check if the keywords really have changed
            if (newVal != oldVal) {
                $scope.newKeywords = true;
                _queryRecommender();
            }
        }, true);

        // Show a dialog with all found results
        $scope.showResults = function(event, selectedTab) {
            $mdDialog.show({
                templateUrl: $sce.trustAsResourceUrl('chrome-extension://' + _extID + '/content/result-dialog/result-dialog.html'),
                controller: 'ResultDialogCtrl',
                resolve: {
                    results: function() {
                        return queryResults;
                    },
                    selectedTab: function() {
                        return selectedTab;
                    },
                    resultNumbers: function() {
                        return $scope.resultNumbers;
                    }
                },
                targetEvent: event
            });
        };

        // checks if the given keyword is already in the list. if yes it removes it. if now it adds it
        $scope.toggleKeyword = function(keyword) {
            var capitalizedKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1);
            var index = $scope.keywords.words.indexOf(capitalizedKeyword);

            if (index === -1) {
                $scope.keywords.words.push(capitalizedKeyword);
            } else {
                $scope.keywords.words.splice(index, 1);
            }
            $scope.$apply();
        };

        function _queryRecommender() {
            if ($scope.keywords.words.length !== 0) {
                MessageService.callBG({
                    method: {service: 'C4Service', func: 'query'},
                    data: $scope.keywords.words
                }, function(result) {
                    if (result.type === 'success') {
                        queryResults = result.data;
                        $scope.resultNumbers = {};
                        $scope.resultNumbers.textResults = 0;
                        $scope.resultNumbers.imageResults = 0;
                        $scope.resultNumbers.avResults = 0;
                        $scope.resultNumbers.unassignedResults = 0;

                        // we uppercase everything because some types are returned lowercase and some uppercase
                        angular.forEach(queryResults, function(item) {
                            if (item.mediaType.toUpperCase() === 'UNKNOWN') {
                                $scope.resultNumbers.unassignedResults++;
                                item.mediaType = item.mediaType.toUpperCase();
                            } else if (item.mediaType.toUpperCase() === 'TEXT') {
                                $scope.resultNumbers.textResults++;
                                item.mediaType = item.mediaType.toUpperCase();
                            } else if (item.mediaType.toUpperCase() === 'IMAGE' || item.type === '3D') {
                                $scope.resultNumbers.imageResults++;
                                item.mediaType = item.mediaType.toUpperCase();
                            } else {
                                $scope.resultNumbers.avResults++;
                                item.mediaType = item.mediaType.toUpperCase();
                            }
                        });

                        $scope.queried = true;
                        $scope.newKeywords = false;
                        $scope.$apply();
                    } else {
                        _showAlertDialog('C4 Database Service');
                    }
                });
            }
        }

        function _showAlertDialog(errorSource) {
            $mdDialog.show(
                $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('An unexpected error occured')
                    .content('We are sorry to inform you that an error occured at the ' + errorSource + '. Please try again or wait a few minutes.')
                    .ariaLabel('Error Dialog')
                    .ok('Ok')
            );
        }
    }

    angular
        .module('Jarvis')
        .controller('ParagraphCtrl', ParagraphCtrl);
})();
