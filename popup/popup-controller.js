(function () {
    'use strict';

    function PopupCtrl($scope) {
        var extID = chrome.i18n.getMessage('@@extension_id');
        $scope.linkToSettings = "chrome://extensions?options=" + extID;
        console.log($scope.linkToSettings);

        // The application.showApp needs to be a unshallow object. Don't ask why. I dare you. I double dare you.
        $scope.application = {};

        // Check if the plugin is disabled or enabled. If no data is found enable it (first startup)
        chrome.storage.sync.get('eRedesign', function (data) {
            chrome.tabs.query({active: true}, function (tab) {
                var tabID = tab[0].id;
                if (data && data.eRedesign && data.eRedesign[tabID] !== undefined) {
                    $scope.application.showApp = data.eRedesign[tabID];
                }
                else {
                    $scope.application.showApp = true;
                }
                $scope.$apply();
            });

        });

        // Save the value of showApp to the storage
        $scope.$watch('application.showApp', function () {
            chrome.tabs.query({active: true}, function (tab) {
                var tabID = tab[0].id;
                var eRedesign = {};
                eRedesign[tabID] = $scope.application.showApp;

                chrome.storage.sync.set({'eRedesign': eRedesign}, function () {
                    console.log("success");
                });
            });
        });

        $scope.showSettings = function () {
            chrome.tabs.create({url: 'chrome://extensions?options=icignkfnpkemhfemfklfcioicajmmhol'});
        }
    }

    angular
        .module('eRedesignPopup')
        .controller('PopupCtrl', PopupCtrl);
})
();
