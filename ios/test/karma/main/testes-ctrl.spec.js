'use strict';

describe('module: main, controller: TestesCtrl', function () {

  // load the controller's module
  beforeEach(module('main'));
  // load all the templates to prevent unexpected $http requests from ui-router
  beforeEach(module('ngHtml2Js'));

  // instantiate controller
  var TestesCtrl;
  beforeEach(inject(function ($controller) {
    TestesCtrl = $controller('TestesCtrl');
  }));

  it('should do something', function () {
    expect(!!TestesCtrl).toBe(true);
  });

});
