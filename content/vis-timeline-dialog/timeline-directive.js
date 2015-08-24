(function () {
    function AnchorDirective($timeout) {
        var clickCounter = 0;
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template: '<span class="anchor" ng-transclude="true"></span>',
            scope: {
                anchorRef: '@'
            },
            link: function(scope, element) {
                element.on('click', function(e) {
                    e.preventDefault();
                    clickCounter++;
                    $timeout(function () {
                        if (clickCounter === 1) {
                            document.location.href = scope.anchorRef;
                            clickCounter = 0;
                        }
                    }, 300);
                });
                element.on('dblclick', function(e) {
                    clickCounter = 0;
                });
            }
        }
    }

    angular
        .module('Jarvis')
        .directive('anchor', AnchorDirective)
})();