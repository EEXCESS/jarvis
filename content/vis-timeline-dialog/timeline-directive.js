(function () {


    var counter = 0; //need counter. scope.id does not work since changes in the data binding can not be applied to the rendering
    //Timeline directive taken and adapted from https://github.com/fmaturel/angular-timelinejs3
    function JarvisTimelineDirective($rootScope, $timeout, TimelineMediaTypeService, $log) {
        counter ++;
        return {

            template: '<div style="height: {{height || 700}}px;"></div>',
            restrict: 'E',
            scope: {
                id: '@',
                data: '=',
                index: '=',
                height: '@',
                lang: '='
            },
            require: '',
            replace: true,
            link: function postLink(scope, element, attr) {

                var timeline;

                //########################################################################## TIMELINE CONFIGURATION

                //@formatter:off
                var conf = {
                    script_path: '',
                    // width: will be 100%,
                    height: scope.height,
                    scale_factor: 1,                    // How many screen widths wide should the timeline be
                    layout: 'landscape',                // portrait or landscape
                    timenav_position: 'bottom',         // timeline on top or bottom
                    optimal_tick_width: 100,            // optimal distance (in pixels) between ticks on axis
                    base_class: '',
                    //timenav_height: 150,
                    timenav_height_percentage: 50,      // Overrides timenav height as a percentage of the screen
                    timenav_height_min: 150,            // Minimum timenav height
                    marker_height_min: 30,              // Minimum Marker Height
                    marker_width_min: 150,              // Minimum Marker Width
                    marker_padding: 5,                  // Top Bottom Marker Padding
                    start_at_slide: 0,
                    //menubar_height: 200,
                    skinny_size: 650,
                    relative_date: false,               // Use momentjs to show a relative date from the slide.text.date.created_time field
                    use_bc: false,                      // Use declared suffix on dates earlier than 0
                    duration: 1000,                     // Slider animation duration
                    ease: VCO.Ease.easeInOutQuint,      // Slider animation type
                    dragging: true,
                    trackResize: true,
                    map_type: 'stamen:toner-lite',
                    slide_padding_lr: 100,              // padding on slide of slide
                    slide_default_fade: '50%',           // landscape fade
                    language: scope.lang || 'en'
                };
                //@formatter:on

                //########################################################################## TIMELINE RENDERING

                var render = function (data) {
                    if (data && !timeline) {
                        $log.debug('Initializing timeline with configuration: ', conf);
                        timeline = new VCO.Timeline(scope.id, new VCO.TimelineConfig(data), conf);
                        timeline.data = data;
                        window.onresize = function (event) {
                            timeline.updateDisplay();
                        };

                        $log.debug('VCO.Timeline object: ', timeline);
                    } else if (data && timeline) {
                        $log.debug('Using new data for timeline');
                        timeline.data = data;
                        timeline.initialize('jarvis-timeline', new VCO.TimelineConfig(data), conf);
                    } else if (!data && timeline) {
                        $log.debug('Rendering timeline with new configuration');
                        timeline.initialize('jarvis-timeline', new VCO.TimelineConfig(timeline.data), conf);
                    }
                };

                // Async cases (when source data coming from services or other async call)
                scope.$watch('data', function (newData) {
                    // Data not ready (maybe waiting on service or other async call)
                    if (!newData) {
                        $log.debug('Waiting for data');
                        return;
                    } else if (newData.events.length === 0) {
                        $log.debug('Data defined but no event in it');
                        return;
                    }
                    render(newData);
                });

                //########################################################################## TIMELINE EVENTS

                /**
                 * We can change current slide from controller
                 */
                scope.$watch('index', function (newIndex) {
                    $log.debug('Detected state change: ', newIndex);
                    if (timeline && newIndex) {
                        timeline.goTo(newIndex);
                    }
                });

                /**
                 * We watch a language change
                 */
                scope.$watch('lang', function (newLang) {
                    $log.debug('Detected lang change: ', newLang);
                    if (timeline && newLang) {
                        conf.language = newLang;
                        render();
                    }
                });

                /**
                 * Key down events do change current Slide
                 */
                angular.element(document.body).on('keydown', function (e) {
                    var keys = {
                        37: 'goToPrev', // Left
                        39: 'goToNext',     // Right
                        36: 'goToStart',    // Home
                        35: 'goToEnd'       // End
                    };
                    var keysProps = Object.getOwnPropertyNames(keys),
                        keyCodeAsString = e.keyCode + '';
                    if (keysProps.indexOf(keyCodeAsString) !== -1) {
                        timeline[keys[keyCodeAsString]]();
                    }
                });

                //########################################################################## TIMELINE OBJECTS

                /**
                 * Overrides common VCO.MediaType with custom types provided by the TimelineMediaTypeService
                 * @see VCO.MediaType
                 * @type {TimelineMediaTypeService.getMediaType|Function}
                 */
                VCO.MediaType = TimelineMediaTypeService.getMediaType;
            }
        }
    };

    angular
        .module('Jarvis')
        .provider('TimelineMediaTypeService', function () {
            //Register the MediaTypeServices here. Should be seen as one with the timeline.
            var vcoMediaType = VCO.MediaType, mediaTypes = [];

            this.addMediaType = function (mediaType) {
                mediaTypes.push({
                    type: mediaType.type,
                    name: mediaType.name,
                    match_str: mediaType.urlRegex,
                    cls: mediaType.cls
                });
            };

            function mediaMatch(m, testUrl) {
                return angular.isObject(m) && angular.isString(m.url) && m.url.match(testUrl);
            }

            this.$get = function () {
                return {
                    getMediaType: function (m) {
                        var result = vcoMediaType(m);
                        if (!result || result.name === 'Imageblank') {
                            for (var i = 0; i < mediaTypes.length; i++) {
                                if (mediaMatch(m, mediaTypes[i].match_str)) {
                                    mediaTypes[i].url = m.url;
                                    return mediaTypes[i];
                                }
                            }
                        }
                        return result;
                    }
                };
            };
        })
        .directive('jarvistimeline', JarvisTimelineDirective, ['$rootScope', '$timeout', 'TimelineMediaTypeService', '$log'])
})
();