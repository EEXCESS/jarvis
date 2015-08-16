(function () {
    'use strict';
    //Note: ContentScriptConfig is loaded through manual bootstrapping
    function AppCtrl($scope, ParagraphDetectionService, ContentScriptSettings) {

    }
    //Load app controller. Note that ContentScriptConfig is loaded through manual bootstrapping in apps.js
    angular
        .module('Jarvis')
        .controller('AppCtrl', AppCtrl)
        .run(function(ParagraphDetectionService, ContentScriptSettings) {
                if (ContentScriptSettings.showJarvis())
                    ParagraphDetectionService.queryParagraphs();
             });
})();