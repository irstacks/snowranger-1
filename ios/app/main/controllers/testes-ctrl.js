'use strict';
angular.module('main')
.controller('TestesCtrl', function ($scope, $log) {

  $scope.test = 'testes';
  $log.log('Hello from your Controller: TestesCtrl in module main:. This is your controller:', this);

});
