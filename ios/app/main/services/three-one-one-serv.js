'use strict';
angular.module('main')
.factory('ThreeOneOne', function ($log, $http, $q, Geo, complainables, Utils) {
  //\\
  $log.log('ThreeOneOne Factory in module main ready for action.');

  // Set up query string for grabbing multiple complaint types at once.
  // -------------------------------------------------------------------------------
  // should accept: complaintTypes []
  //              : open_dt string
  //              : limit integer
  //              :

  var buildQueryString = function (limit, status, opened_date, complaintTypes) {

    // Set defaults if no val passed.
    limit = typeof limit !== 'undefined' ? limit : 100;
    status = typeof status !== 'undefined' ? status : 'Either'; // default to include either open or closed
    opened_date = typeof opened_date !== 'undefined' ? opened_date : '2016-03-01T00:00:00';
    complaintTypes = typeof complaintTypes !== 'undefined' ? complaintTypes : complainables.GRIPES;

    // Base url.
    var bostonUrl = 'https://data.cityofboston.gov/resource/awu8-dc52.json'

    // Let's build a query string!
    var queryString = "";
    queryString += "&$where=";

    // Status picker.
    if (status === 'Open'){
      queryString += "case_status = 'Open'  AND ";
    }
    else if (status === 'Closed') {
      queryString += "case_status = 'Closed'  AND ";
    }
    else {
      // queryString += "case_status = 'Open'";
    }



    queryString += "open_dt > '" + opened_date + "'";
    // queryString += " AND STARTS_WITH(case_title, 'Ground Maintenance') OR STARTS_WITH(case_title, 'Park Maintenance')";
    queryString += " AND ("

    // STARTS_WITH(case_title, 'Request For Snow Plowing') OR STARTS_WITH(case_title, 'Ground Maintenance')
    for (var i = 0; i < complaintTypes.length; i++) {
      var type = complaintTypes[i];
      var caseAttr = 'case_title';
      queryString += "STARTS_WITH(" + caseAttr + ", '" + type + "')"
      // if there are more than one complaint types and given type is not last in the array, then append an OR
      if (complaintTypes.length > 1 && complaintTypes.indexOf(type) !== complaintTypes.length - 1) {
        queryString += " OR ";
      } else {
        queryString += ")";
      }
    }

    var orderer = "&$order=open_dt DESC";

    var queryable = bostonUrl + "?$limit=" + limit + queryString + orderer;
      //\\
      $log.log("full query url encoded:", queryable);
    return queryable;
  };

  function asyncHTTP(queryable) {
    var defer = $q.defer();

    $http({
      method: 'GET',
      url: queryable,
      headers: {
        'X-App-Token': 'zdkQROnSL8UlsDCjuiBcc3VHq' //'k7chiGNz0GPFKd4dS03IEfKuE'
      }
    }).success(function (data, status, headers, config) {
        defer.resolve({data: data});
      })
      .error(function (data, status, headers, config) {
        defer.reject({status: status, data: data});
      });
    return defer.promise;
  };

  // var addToGeofire = function (key, loc) {
  //   return Geo.set(key, loc).then(function added311ToGeofire () {
  //     $log.log('Added case id: ' + key + ' to geofire at ' + loc);
  //   });
  // };

  var getBoston311Data = function(query) {

    var defer = $q.defer();
    // var query = buildQueryString(complaintTypes);

    // This will hold an array object information for each complaint type.
    // We're going to return this so the controller can populate markers on the map.
    // [{description: 'People are annoying',
    //   location: {
    //     latitude: 42.123,
    //     longitude: 71.12312
    //   },
    //   address: "51 Market Street, Cambride, MA"
    // },{...}]
    var boston311MarkerInfos = [];

    asyncHTTP(query)
      .then(function successful311Query(data) {
        for (var i = 0; i < data.data.length; i++) {

          // for geofire
          var locArray = [
            data.data[i].latitude,
            data.data[i].longitude
          ];

          // for markers
          var loc = {
              latitude: data.data[i].latitude,
              longitude: data.data[i].longitude
          };

          // Add to geofire
          // addToGeofire(data.data[i].case_enquiry_id, locArray);

          boston311MarkerInfos.push({
              id: data.data[i].case_enquiry_id,

              description: data.data[i].case_title,
              location: loc,
              address: data.data[i].location,
              case_status: data.data[i].case_status,
              open_dt: data.data[i].open_dt,
              closed_dt: data.data[i].closed_dt
          });
        }


        var boston311MarkerInfos_WithIcons = Utils.setIcons(boston311MarkerInfos);

        defer.resolve(boston311MarkerInfos_WithIcons);
      }, function error311Query(err) {
        $log.log("Shit! Error. Status: " + err.status + "\n" + err.data);
        defer.reject({error: err});
      });

    return defer.promise;
  };

  // Angular Factories, being singletons, have to return a thing.
  return {
    get311: getBoston311Data,
    buildQuery: buildQueryString
    // , get311Fake: getFake311Data
  };
});
