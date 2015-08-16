(function () {
    'use strict';

    // Intended Settings/Behaviour in the popup
    // Properties:
    // - link to settings
    // - Jarvis activation behaviour
    //   - Activate/Deactivate Jarvis ---> Main Switch. Config via showApp. If false, Jarvis wont do anything.
    //   - If activated --> Activate on known servers, Do not activate on blocked servers, always activate
    //   - If activated --> Block server {URL} / Activate on server {URL}
    // click Popup --> show popup.html
    function PopupCtrl($scope) {
        var extID = chrome.i18n.getMessage('@@extension_id');
        var linkToSettings = "chrome://extensions?options=" + extID;

        // The application.showApp needs to be a unshallow object. Don't ask why. I dare you. I double dare you.
        $scope.config = {};
        // to have all possible option values in one place.
        $scope.urlCheckOptions = [{'value':'whitelist', 'label': 'Activate on allowed sites only'},
                                  {'value':'blacklist', 'label': 'Activate never on blocked sites'},
                                  {'value':'always', 'label': 'Activate always'}]
        // Synchronize data with storage and set application state variables
        // TODO: Harmonize local storage with JarvisSettings. 1 Place for all configurations!
        // TODO: Create a config for the content script to access declaration of Constants
        chrome.storage.sync.get('JarvisContentScriptSettings', function (data) {
            if (data && 'JarvisContentScriptSettings' in data){
                $scope.config = data['JarvisContentScriptSettings']
            }else{
                $scope.config = {
                    "showApp" : true,
                    "urlCheck" : 'blacklist',
                    "bwlist" : {},
                };
            }
            $scope.$apply();
        });
        //$scope.config = ContentScriptSettings;
        // Save the value of showApp to the storage
        $scope.$watchGroup(['config.showApp','config.urlCheck'], function () {
            _store($scope.config);
        });
        //get current tab and its url
        $scope.currentTabSite = "";
        chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
            $scope.currentTabSite = null;
            if (tabs[0].url) {
                var url = new URL(tabs[0].url);
                $scope.currentTabSite = url.origin;
            }
            $scope.$apply();
        });

        // add link to settings
        $scope.showSettings = function () {
            chrome.tabs.create({url: linkToSettings});
        };

        $scope.isBlackList = function (){
             return $scope.config.showApp && $scope.config.urlCheck == 'blacklist' && $scope.currentTabSite!=''
        };

        $scope.isWhiteList = function (){
             return $scope.config.showApp && $scope.config.urlCheck == 'whitelist' && $scope.currentTabSite!=''
        };

        $scope.blockCurrentSite = function (){
             if ($scope.currentTabSite && $scope.currentTabSite!=''){
                if (!$scope.config.bwlist) $scope.config.bwlist ={};
                $scope.config.bwlist[$scope.currentTabSite] = false;
                _store($scope.config);
                _reload_current_tab()
             }
        };
        $scope.allowCurrentSite = function (){
             if ($scope.currentTabSite && $scope.currentTabSite!=''){
                if (!$scope.config.bwlist) $scope.config.bwlist ={};
                $scope.config.bwlist[$scope.currentTabSite] = true;
                _store($scope.config);
                _reload_current_tab();
             }
        };

         var _reload_current_tab = function (){
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                chrome.tabs.reload(tabs[0].id);
            });
        };

        var _store  = function (config){
            chrome.storage.sync.set({'JarvisContentScriptSettings': config});
        }
    }

    angular
        .module('JarvisPopup')
        .controller('PopupCtrl', PopupCtrl);
})
();
