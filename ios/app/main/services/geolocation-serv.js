'use strict';
angular.module('main')

// Geofire via angularGeoFire (which creates scoped binding for geofire events)
// .factory('Geo', ['Ref', '$geofire', function (Ref, $geofire) {
//   // Note: without angularGeoFire, just remove '$geofire' injections and use
//   // return new GeoFire(Ref.child('geo'));

//   return $geofire(Ref.child('geo'));
// }])

// Promise to get current user's geolocation and ( and we could set it in a userGeo ref)
.factory('Geolocation', function ($cordovaGeolocation, $q, $http) {
  console.log('GeoLocate Factory reporting for duty.');

  // Calling GeoLocation.get() will attempt to get the current location of the
  // device in use.
  function get () {
    var defer = $q.defer();
    var options = {
      timeout: 10000,
      enableHighAccuracy: true
    };
    $cordovaGeolocation.getCurrentPosition(options)
      .then(
        function gotPositionCordova (position) { // Success.
          defer.resolve(position); // Resolve position.
        },
        // Error.
        function (error) {
          // defer.reject({ERROR: error});
          // console.log('ERROR: ' + error);

          // No cordova? Let's try HTML5 for kicks.
          navigator.geolocation.getCurrentPosition(function gotPositionHTML (position) {
            defer.resolve(position);
          }, function noPositionHTML(err) {
            defer.reject({ERROR: error});
          });
        }
      );
    return defer.promise;
  };

  // Accepts lat + lng, returns location json data from google.
  function getNearByCity (latitude, longitude){
      var defer = $q.defer();
      var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude +',' + longitude +'&sensor=true';
      $http({method: 'GET', url: url}).
        success(function(data, status, headers, config) {
             defer.resolve({data : data});
        }).
        error(function(data, status, headers, config) {
          defer.reject({error: 'City not found'});
        });
      return defer.promise;
  }

  return {
    get: get,
    getNearByCity: getNearByCity
  };
});
