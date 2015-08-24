(function () {
    'use strict';

    function SettingsCtrl($scope, $timeout, $sce) {
        //black white list
        var _extID = chrome.i18n.getMessage('@@extension_id');
        $scope.icon_remove = $sce.trustAsResourceUrl('chrome-extension://' + _extID + '/media/icons/remove-icon18.svg');
         chrome.storage.sync.get('JarvisContentScriptSettings', function (data) {
            if (data && 'JarvisContentScriptSettings' in data){
                $scope.csConfig = data['JarvisContentScriptSettings']
            }else{
                $scope.csConfig = {
                    "showApp" : true,
                    "urlCheck" : 'blacklist',
                    "bwlist" : {},
                    "enableExperimentalFeatures" : false,
                };
            }
            $scope.$apply();
        });
        $scope.removeBWListEntry = function(url){
                delete $scope.csConfig.bwlist[url];
        };

        $scope.settings = {};
        $scope.languages = [
            {
                abbrev: 'fr',
                name: 'French'
            },
            {
                abbrev: 'en',
                name: 'English'
            },
            {
                abbrev: 'de',
                name: 'German'
            },
            {
                abbrev: '',
                name: 'All languages'
            }
        ];

        chrome.storage.sync.get('JarvisSettings', function (data) {
            if (data && data.JarvisSettings) {
                $scope.onlyOpen = data.JarvisSettings.onlyOpen;
                $scope.resultNumber = data.JarvisSettings.resultNumber;
                $scope.language = data.JarvisSettings.language;
            } else {
                $scope.onlyOpen = false;
                $scope.resultNumber = 30;
                $scope.language = '';
            }
            $scope.$apply();
        });
        
        $scope.save = function () {
            chrome.storage.sync.set({
                'JarvisSettings': {
                    onlyOpen: $scope.onlyOpen,
                    resultNumber: $scope.resultNumber,
                    language: $scope.language
                },
                'JarvisContentScriptSettings': $scope.csConfig
            }, function () {
                    $scope.feedback = 'saved';

                    $timeout(function () {
                        $scope.feedback = '';
                      }, 3000);
            });
        };

        $scope.feedback = undefined;

    }

    angular
        .module('JarvisSettings')
        .controller('SettingsCtrl', SettingsCtrl);
})();
