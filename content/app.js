function MdThemeConfig ($mdThemingProvider) {

    $mdThemingProvider.theme('default')
        .primaryPalette('indigo')
        .accentPalette('red');
}

angular
    .module('Jarvis', [
                'ngAnimate',
                'ngMaterial'])
    .config(MdThemeConfig);



// we need to inject the angular app and controller attributes to bootstrap the application
//add controller first.
$("body").attr('ng-controller', 'AppCtrl');
//then do manual bootstrap of angular since we need to load the configuration first.
angular.element(document).ready(
    function() {
        chrome.storage.sync.get('JarvisContentScriptSettings', function (data) {
            var config = {};
            if (data && 'JarvisContentScriptSettings' in data){
                config = data['JarvisContentScriptSettings']
            }else{
                config = {
                    "showApp" : true,
                    "urlCheck" : 'blacklist',
                    "bwlist" : {},
                    "enableExperimentalFeatures" : false,
                };
            }

            chrome.storage.onChanged.addListener(function(changes) {
                if (changes.JarvisContentScriptSettings){
                    var change = changes.JarvisContentScriptSettings;
                    if (change.newValue){
                        if (change.newValue.showApp != change.oldValue.showApp){
                            config.showApp = change.newValue.showApp;
                            //angular.module(['Jarvis']).name('ContentScriptSettings', {});
                        }
                        if (change.newValue.urlCheck != change.oldValue.urlCheck){
                            config.urlCheck = change.newValue.urlCheck;
                            console.log("checkulr changed to "+config.urlCheck);
                            //angular.module(['Jarvis']).name('ContentScriptSettings', {});
                        }
                        if (change.newValue.enableExperimentalFeatures != change.oldValue.enableExperimentalFeatures){
                            config.enableExperimentalFeatures = change.newValue.enableExperimentalFeatures;
                            console.log("enableExperimentalFeatures changed to " + config.enableExperimentalFeatures);
                            //angular.module(['Jarvis']).name('ContentScriptSettings', {});
                        }

                        //note: in case of bwlist change we reload the page, so no need to care about.
                    }
                }
            });
            config.showJarvis = function(){
                if (config.showApp){
                    if (config.urlCheck=='always'){
                        return true;
                    }else {
                        var whitelisted;
                        var myUrl = new URL(document.URL).origin;
                        if (config.bwlist && myUrl in config.bwlist) {
                            whitelisted = config.bwlist[myUrl];
                        }
                        if (config.urlCheck == 'blacklist' && (whitelisted || whitelisted === undefined)) {
                            return true;
                        }
                        if (config.urlCheck == 'whitelist' && whitelisted) {
                            return true;
                        }
                    }
                }
                return false;
            };

            //set config here as constant.
            angular.module(['Jarvis']).constant('ContentScriptSettings', config);
            //init angular
            angular.bootstrap(document, ['Jarvis']);
        });
    }
);