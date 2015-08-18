

angular.module('Jarvis')
    .filter("groupByFilter", function () {
                return function (collection, key) {
                    //does not work for views because of angulars tracking and i do not want to risk memory leaks.
                    // see http://stackoverflow.com/questions/16507040/angular-filter-works-but-causes-10-digest-iterations-reached
                    if (collection === null) return;
                      var returns = {};
                    _.map(collection, function(o){
                        var key_val =  eval("o."+key);
                        if (!(key_val in returns)){
                            returns[key_val] = [];
                        }
                        returns[key_val].push(o);
                    });
                    return returns
                    //return _.groupBy(collection, function(o) {return o.key});
                };
            })
    .filter('countFilter', function() {
                return function (collection, key) {//returns the unique items+# of a list of arrays according to a key
                    if (collection === null) return;
                    var returns = {};
                    _.map(collection, function (o) {
                        var key_val = eval("o." + key);
                        if (!(key_val in returns)) {
                            returns[key_val] = 1;
                        } else {
                            returns[key_val] += 1;
                        }
                    });
                    return returns;
                }
    })
     .filter('selectFilter', function () {
            return function (collection, key, filterExp) {
                if (collection === null) return;
                    var returns = [];
                    _.map(collection, function (o) {
                        var key_val = eval("o." + key);
                        if (key_val==filterExp) {
                            returns.push(o);
                        }
                    });
                    return returns;
            };
        })
    .filter('resultFilter', function () {
            return function (results, types) {
                //debugger;
                var out = [];
                angular.forEach(results, function (value) {
                    if (types[value.mediaType] === true) {
                        out.push(value);
                    }
                });
                return out;
            };
        });


