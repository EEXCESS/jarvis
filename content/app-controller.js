(function () {
    'use strict';

    function AppCtrl($scope) {
        console.log("hey");

        chrome.runtime.onMessage.addListener(function() {
            alert("hey");
            console.log("hey");
        });
    }

    angular
        .module('eRedesign')
        .controller('AppCtrl', AppCtrl);
})();